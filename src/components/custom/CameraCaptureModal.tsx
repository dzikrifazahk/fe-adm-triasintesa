"use client";
import { useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

export default function CameraCaptureModal({
  open,
  onClose,
  onCapture,
}: {
  open: boolean;
  onClose: () => void;
  onCapture: (image: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (open) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch((err) => {
          console.error("Gagal mengakses kamera:", err);
        });
    }

    return () => {
      const tracks = (videoRef.current?.srcObject as MediaStream)?.getTracks();
      tracks?.forEach((track) => track.stop());
    };
  }, [open]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, 320, 240)
        const imageData = canvas.toDataURL("image/png");
        onCapture(imageData);
        onClose();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex flex-col items-center space-y-4 p-6">
        <DialogHeader>
          <DialogTitle>Ambil Gambar</DialogTitle>
        </DialogHeader>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          width="320"
          height="240"
          className="rounded border shadow"
        />
        <canvas ref={canvasRef} width="320" height="240" className="hidden" />
        <Button onClick={handleCapture} className="flex items-center gap-2">
          <Camera className="w-4 h-4" /> Ambil Gambar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
