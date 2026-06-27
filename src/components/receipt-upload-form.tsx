"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Check, FileCheck2, LoaderCircle, ReceiptText, RotateCcw, Upload } from "lucide-react";
import { addRenovationCostItemAction } from "@/app/actions";
import { suggestReceiptDetails } from "@/lib/receipt";

const roomOptions = [
  "Kitchen",
  "Bathroom",
  "Living room",
  "Bedroom",
  "Hallway",
  "Utility / workshop",
  "Exterior",
  "Whole house",
  "General",
];

type ReviewDetails = {
  amount: string;
  description: string;
  supplier: string;
};

export function ReceiptUploadForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [room, setRoom] = useState("Kitchen");
  const [review, setReview] = useState<ReviewDetails | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, startSaving] = useTransition();

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function chooseFile(nextFile: File | undefined) {
    setError("");
    setReview(null);
    setProgress(0);
    setFile(null);
    setPreviewUrl("");

    if (!nextFile) {
      return;
    }
    if (!nextFile.type.startsWith("image/")) {
      setError("Please choose a photo of the receipt.");
      return;
    }
    if (nextFile.size > 12 * 1024 * 1024) {
      setError("That photo is larger than 12 MB. Please choose a smaller image.");
      return;
    }

    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
  }

  async function scanReceipt() {
    if (!file) return;

    setIsScanning(true);
    setError("");
    setProgress(0.02);

    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng", undefined, {
        logger(message) {
          if (message.status === "recognizing text") setProgress(message.progress);
        },
      });

      try {
        const result = await worker.recognize(file, { rotateAuto: true });
        const suggestion = suggestReceiptDetails(result.data.text);
        setReview({
          amount: suggestion.amount?.toFixed(2) ?? "",
          description: suggestion.description,
          supplier: suggestion.supplier,
        });
      } finally {
        await worker.terminate();
      }
    } catch {
      setError("I couldn’t read that photo. Try a clearer, straighter photo, or add the purchase manually.");
    } finally {
      setIsScanning(false);
    }
  }

  function reset() {
    setFile(null);
    setPreviewUrl("");
    setReview(null);
    setProgress(0);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function approveReceipt(formData: FormData) {
    startSaving(async () => {
      await addRenovationCostItemAction(formData);
      reset();
      router.refresh();
    });
  }

  return (
    <div className="border-t border-slate-700 p-4">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-md border border-sky-400/30 bg-sky-400/10 text-sky-300">
          <ReceiptText size={20} />
        </span>
        <div>
          <h3 className="font-semibold text-white">Scan a receipt</h3>
          <p className="mt-1 text-sm text-slate-400">Photograph a receipt, check the details, then approve it for the tracker.</p>
        </div>
      </div>

      {!review ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]">
          <div>
            <button
              className="flex min-h-40 w-full flex-col items-center justify-center gap-3 rounded-md border border-dashed border-slate-600 bg-[#111318] px-4 text-center transition hover:border-sky-400 hover:bg-sky-400/5"
              disabled={isScanning}
              onClick={() => inputRef.current?.click()}
              type="button"
            >
              {previewUrl ? (
                <span className="relative block h-52 w-full overflow-hidden rounded">
                  <Image alt="Receipt ready to scan" className="object-contain" fill sizes="(max-width: 1024px) 100vw, 50vw" src={previewUrl} unoptimized />
                </span>
              ) : (
                <>
                  <Upload className="text-sky-300" size={24} />
                  <span className="font-medium text-white">Take a photo or choose one</span>
                  <span className="text-xs text-slate-500">JPG, PNG or WebP, up to 12 MB</span>
                </>
              )}
            </button>
            <input
              ref={inputRef}
              accept="image/jpeg,image/png,image/webp,image/*"
              capture="environment"
              className="sr-only"
              onChange={(event) => chooseFile(event.target.files?.[0])}
              type="file"
            />
          </div>

          <div className="grid content-start gap-4">
            <fieldset>
              <legend className="text-sm font-medium text-slate-200">Which room is it for?</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {roomOptions.map((option) => (
                  <label key={option}>
                    <input
                      checked={room === option}
                      className="peer sr-only"
                      name="receipt-room"
                      onChange={() => setRoom(option)}
                      type="radio"
                      value={option}
                    />
                    <span className="inline-flex h-9 cursor-pointer items-center rounded-md border border-slate-700 bg-[#111318] px-3 text-sm font-medium text-slate-300 transition peer-checked:border-sky-400 peer-checked:bg-sky-400/15 peer-checked:text-sky-200">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {error ? <p className="rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p> : null}

            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-sky-500 px-4 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              disabled={!file || isScanning}
              onClick={scanReceipt}
              type="button"
            >
              {isScanning ? <LoaderCircle className="animate-spin" size={17} /> : <ReceiptText size={17} />}
              {isScanning ? `Reading receipt ${Math.round(progress * 100)}%` : "Read receipt"}
            </button>
          </div>
        </div>
      ) : (
        <form action={approveReceipt} className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="relative min-h-64 overflow-hidden rounded-md border border-slate-700 bg-[#111318]">
            <Image alt="Receipt being reviewed" className="object-contain" fill sizes="220px" src={previewUrl} unoptimized />
          </div>

          <div className="grid gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <FileCheck2 size={18} />
              Ready for your approval
            </div>
            <input name="projectId" type="hidden" value={projectId} />
            <input name="tag" type="hidden" value={room} />
            <input name="purchased" type="hidden" value="on" />
            <input name="notes" type="hidden" value="Added from an approved receipt scan." />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium text-slate-200 sm:col-span-2">
                Product description
                <input
                  className="h-10 rounded-md border border-slate-700 bg-[#111318] px-3 text-sm text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                  name="name"
                  onChange={(event) => setReview({ ...review, description: event.target.value })}
                  required
                  value={review.description}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-slate-200">
                Amount
                <span className="flex h-10 overflow-hidden rounded-md border border-slate-700 bg-[#111318] focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-400/20">
                  <span className="grid w-10 place-items-center border-r border-slate-700 text-slate-400">£</span>
                  <input
                    className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none"
                    min="0.01"
                    name="amount"
                    onChange={(event) => setReview({ ...review, amount: event.target.value })}
                    required
                    step="0.01"
                    type="number"
                    value={review.amount}
                  />
                </span>
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-slate-200">
                Supplier
                <input
                  className="h-10 rounded-md border border-slate-700 bg-[#111318] px-3 text-sm text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                  name="supplier"
                  onChange={(event) => setReview({ ...review, supplier: event.target.value })}
                  placeholder="B&Q"
                  value={review.supplier}
                />
              </label>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-200">Room</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {roomOptions.map((option) => (
                  <button
                    className={`h-9 rounded-md border px-3 text-sm font-medium transition ${
                      room === option
                        ? "border-sky-400 bg-sky-400/15 text-sky-200"
                        : "border-slate-700 bg-[#111318] text-slate-400 hover:text-white"
                    }`}
                    key={option}
                    onClick={() => setRoom(option)}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-700 px-4 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
                disabled={isSaving}
                onClick={reset}
                type="button"
              >
                <RotateCcw size={16} />
                Scan again
              </button>
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-wait disabled:opacity-60"
                disabled={isSaving}
                type="submit"
              >
                {isSaving ? <LoaderCircle className="animate-spin" size={17} /> : <Check size={17} />}
                {isSaving ? "Adding purchase..." : "Approve and add purchase"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
