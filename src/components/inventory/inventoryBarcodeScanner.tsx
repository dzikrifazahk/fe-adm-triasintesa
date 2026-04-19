"use client";

import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Barcode, Camera, CameraOff } from "lucide-react";
import { getDictionary } from "../../../get-dictionary";

type DetectedBarcode = {
  rawValue?: string;
};

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<DetectedBarcode[]>;
};

type BarcodeDetectorCtor = new (options?: {
  formats?: string[];
}) => BarcodeDetectorLike;

type Props = {
  value: string;
  onChange: (value: string) => void;
  autoRestartKey?: number;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["inventory_page_dic"];
};

export function InventoryBarcodeScanner({
  value,
  onChange,
  autoRestartKey = 0,
  dictionary,
}: Props) {
  const barcodeInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<BarcodeDetectorLike | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const cameraSessionRef = useRef(0);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [barcodeSupported, setBarcodeSupported] = useState(false);
  const [cameraAccessSupported, setCameraAccessSupported] = useState(false);
  const [lastDetectedBarcode, setLastDetectedBarcode] = useState("");

  useEffect(() => {
    setCameraAccessSupported(
      typeof navigator !== "undefined" &&
        !!navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === "function",
    );

    const Detector = (
      window as Window & { BarcodeDetector?: BarcodeDetectorCtor }
    ).BarcodeDetector;

    if (!Detector) {
      setBarcodeSupported(false);
      return;
    }

    detectorRef.current = new Detector({
      formats: ["code_128", "code_39", "ean_13", "ean_8", "qr_code"],
    });
    setBarcodeSupported(true);
    setIsCameraActive(true);
  }, []);

  useEffect(() => {
    if (autoRestartKey > 0 && barcodeSupported) {
      setIsCameraActive(true);
      barcodeInputRef.current?.focus();
    }
  }, [autoRestartKey, barcodeSupported]);

  useEffect(() => {
    let isDisposed = false;

    const stopCamera = () => {
      cameraSessionRef.current += 1;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setCameraReady(false);
    };

    const detectLoop = async () => {
      const video = videoRef.current;
      const detector = detectorRef.current;

      if (
        !isCameraActive ||
        !video ||
        !detector ||
        video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA
      ) {
        animationFrameRef.current = requestAnimationFrame(detectLoop);
        return;
      }

      try {
        const detectedBarcodes = await detector.detect(video);
        const barcodeValue = detectedBarcodes.find((item) => item.rawValue)?.rawValue;

        if (barcodeValue) {
          setLastDetectedBarcode(barcodeValue);
          onChange(barcodeValue);
          setIsCameraActive(false);
          Swal.fire({
            icon: "success",
            title: dictionary.toast.barcode_detected_title,
            toast: true,
            position: "top-right",
            timer: 1600,
            showConfirmButton: false,
          });
          return;
        }
      } catch (error) {
        console.error("Barcode detection error:", error);
      }

      animationFrameRef.current = requestAnimationFrame(detectLoop);
    };

    const startCamera = async () => {
      if (!isCameraActive) {
        stopCamera();
        return;
      }

      const sessionId = cameraSessionRef.current + 1;
      cameraSessionRef.current = sessionId;

      try {
        setCameraError("");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
          },
          audio: false,
        });

        if (isDisposed || cameraSessionRef.current !== sessionId) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (error) {
            const videoError = error as Error & { name?: string };
            const isInterrupted =
              videoError?.name === "AbortError" ||
              videoError?.message?.includes("interrupted by a new load request");

            if (isDisposed || cameraSessionRef.current !== sessionId || isInterrupted) {
              return;
            }

            throw error;
          }
        }

        if (isDisposed || cameraSessionRef.current !== sessionId) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        setCameraReady(true);
        animationFrameRef.current = requestAnimationFrame(detectLoop);
      } catch (error) {
        if (isDisposed || cameraSessionRef.current !== sessionId) {
          return;
        }
        console.error(error);
        setCameraError(dictionary.toast.camera_access_error);
        setIsCameraActive(false);
      }
    };

    void startCamera();

    return () => {
      isDisposed = true;
      stopCamera();
    };
  }, [isCameraActive, onChange]);

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
        {dictionary.scanner.barcode_label}
      </label>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={isCameraActive ? "secondary" : "outline"}
          className="h-10"
          onClick={() => setIsCameraActive((prev) => !prev)}
          disabled={!barcodeSupported || !cameraAccessSupported}
        >
          {isCameraActive ? (
            <>
              <CameraOff className="mr-2 h-4 w-4" />
              {dictionary.scanner.camera_off_button}
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              {dictionary.scanner.camera_on_button}
            </>
          )}
        </Button>
        {barcodeSupported && cameraAccessSupported ? (
          <Badge className="bg-[#2B59FF] text-white">{dictionary.scanner.webcam_badge}</Badge>
        ) : null}
        {!cameraAccessSupported ? (
          <Badge className="bg-red-600 text-white">{dictionary.scanner.camera_denied_badge}</Badge>
        ) : null}
        {!barcodeSupported ? (
          <Badge className="bg-amber-600 text-white">
            {dictionary.scanner.detector_unsupported_badge}
          </Badge>
        ) : null}
        {cameraReady && isCameraActive ? (
          <Badge className="bg-emerald-600 text-white">
            {dictionary.scanner.camera_active_badge}
          </Badge>
        ) : null}
      </div>

      {isCameraActive ? (
        <div className="mb-4 overflow-hidden rounded-2xl border bg-slate-950 shadow-[0_18px_45px_rgba(15,23,42,0.22)]">
          <div className="relative aspect-video w-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
              <div className="h-32 w-full max-w-sm rounded-2xl border-2 border-dashed border-cyan-300/90 bg-cyan-300/10 shadow-[0_0_0_9999px_rgba(15,23,42,0.35)]" />
            </div>
          </div>
          <div className="border-t border-white/10 px-4 py-3 text-sm text-slate-200">
            {dictionary.scanner.camera_hint}
          </div>
        </div>
      ) : barcodeSupported && cameraAccessSupported ? (
        <div className="mb-4 rounded-2xl border border-dashed border-[#CFE0FF] bg-[#F8FBFF] px-4 py-5 text-sm text-slate-600 dark:border-[#3C4D72] dark:bg-[#1F2430] dark:text-slate-300">
          {dictionary.scanner.camera_idle_prefix}{" "}
          <span className="font-semibold">{dictionary.scanner.camera_on_button}</span>{" "}
          {dictionary.scanner.camera_idle_suffix}
        </div>
      ) : null}

      {cameraError ? (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {cameraError}
        </div>
      ) : null}

      {lastDetectedBarcode ? (
        <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          {dictionary.scanner.last_detected_label}{" "}
          <span className="font-semibold">{lastDetectedBarcode}</span>
        </div>
      ) : null}

      <div className="relative">
        <Barcode className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          ref={barcodeInputRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={dictionary.scanner.barcode_placeholder}
          className="h-12 pl-10 text-base"
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {dictionary.scanner.helper_text}
      </p>
    </div>
  );
}
