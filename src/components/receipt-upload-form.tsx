"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Check, FileCheck2, LoaderCircle, Plus, ReceiptText, RotateCcw, Trash2, Upload } from "lucide-react";
import { addRenovationReceiptItemsAction } from "@/app/actions";
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
  items: { amount: string; description: string; id: string }[];
  receiptTotal: string;
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
  const lineItemsTotal = review
    ? Math.round(review.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) * 100) / 100
    : 0;
  const receiptTotal = Number(review?.receiptTotal);
  const totalsMatch = review ? Number.isFinite(receiptTotal) && Math.abs(lineItemsTotal - receiptTotal) <= 0.02 : false;

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
      const { createWorker, PSM } = await import("tesseract.js");
      const worker = await createWorker("eng", undefined, {
        logger(message) {
          if (message.status === "recognizing text") setProgress(message.progress);
        },
      });

      try {
        await worker.setParameters({
          preserve_interword_spaces: "1",
          tessedit_pageseg_mode: PSM.SPARSE_TEXT,
          user_defined_dpi: "300",
        });
        const result = await worker.recognize(file, { rotateAuto: true });
        const suggestion = suggestReceiptDetails(result.data.text);
        setReview({
          items: suggestion.items.map((item) => ({
            amount: item.amount > 0 ? item.amount.toFixed(2) : "",
            description: item.description,
            id: crypto.randomUUID(),
          })),
          receiptTotal: suggestion.amount?.toFixed(2) ?? "",
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
      await addRenovationReceiptItemsAction(formData);
      reset();
      router.refresh();
    });
  }

  function updateItem(id: string, changes: Partial<ReviewDetails["items"][number]>) {
    if (!review) return;
    setReview({
      ...review,
      items: review.items.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    });
  }

  function removeItem(id: string) {
    if (!review) return;
    setReview({ ...review, items: review.items.filter((item) => item.id !== id) });
  }

  function addItem() {
    if (!review) return;
    setReview({
      ...review,
      items: [...review.items, { amount: "", description: "", id: crypto.randomUUID() }],
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
            <input
              name="items"
              type="hidden"
              value={JSON.stringify(
                review.items.map((item) => ({
                  amount: Number(item.amount),
                  description: item.description,
                })),
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
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
              <label className="grid gap-1.5 text-sm font-medium text-slate-200">
                Receipt total
                <span className="flex h-10 overflow-hidden rounded-md border border-slate-700 bg-[#111318] focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-400/20">
                  <span className="grid w-10 place-items-center border-r border-slate-700 text-slate-400">£</span>
                  <input
                    className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none"
                    min="0.01"
                    onChange={(event) => setReview({ ...review, receiptTotal: event.target.value })}
                    required
                    step="0.01"
                    type="number"
                    value={review.receiptTotal}
                  />
                </span>
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-200">Line items</p>
                <button
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-700 px-2.5 text-xs font-semibold text-slate-300 transition hover:border-sky-400 hover:text-sky-200"
                  onClick={addItem}
                  type="button"
                >
                  <Plus size={14} />
                  Add line
                </button>
              </div>
              <div className="mt-2 grid gap-2">
                {review.items.map((item, index) => (
                  <div className="grid grid-cols-[minmax(0,1fr)_105px_36px] gap-2" key={item.id}>
                    <label className="grid gap-1">
                      <span className="sr-only">Description for line {index + 1}</span>
                      <input
                        aria-label={`Description for line ${index + 1}`}
                        className="h-10 min-w-0 rounded-md border border-slate-700 bg-[#111318] px-3 text-sm text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                        onChange={(event) => updateItem(item.id, { description: event.target.value })}
                        placeholder="Product description"
                        required
                        value={item.description}
                      />
                    </label>
                    <label className="flex h-10 overflow-hidden rounded-md border border-slate-700 bg-[#111318] focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-400/20">
                      <span className="grid w-7 shrink-0 place-items-center border-r border-slate-700 text-xs text-slate-400">£</span>
                      <span className="sr-only">Amount for line {index + 1}</span>
                      <input
                        aria-label={`Amount for line ${index + 1}`}
                        className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none"
                        min="0.01"
                        onChange={(event) => updateItem(item.id, { amount: event.target.value })}
                        required
                        step="0.01"
                        type="number"
                        value={item.amount}
                      />
                    </label>
                    <button
                      aria-label={`Remove line ${index + 1}`}
                      className="grid size-9 place-items-center self-center rounded-md border border-slate-700 text-slate-400 transition hover:border-rose-400 hover:bg-rose-500/10 hover:text-rose-200"
                      disabled={review.items.length === 1}
                      onClick={() => removeItem(item.id)}
                      type="button"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <div
                className={`mt-3 flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
                  totalsMatch
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-200"
                }`}
              >
                <span>{totalsMatch ? "Line items match the receipt" : "Line items do not yet match the receipt"}</span>
                <strong>£{lineItemsTotal.toFixed(2)} / £{Number.isFinite(receiptTotal) ? receiptTotal.toFixed(2) : "0.00"}</strong>
              </div>
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
                disabled={isSaving || !totalsMatch || review.items.length === 0}
                type="submit"
              >
                {isSaving ? <LoaderCircle className="animate-spin" size={17} /> : <Check size={17} />}
                {isSaving ? "Adding purchases..." : `Approve and add ${review.items.length} ${review.items.length === 1 ? "item" : "items"}`}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
