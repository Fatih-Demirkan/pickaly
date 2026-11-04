"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

// "Görsel Olarak Paylaş (Sosyal / Mesaj)" (PRD FR-REP-007, TECH_STACK §5.5 / D-11): kart istemcide PNG'ye çevrilir;
// tarayıcı dosya paylaşımını destekliyorsa Web Share API ile paylaşılır, desteklemiyorsa indirilir.
// Görsel, ekrandaki genişlikten bağımsız olarak 358 px kart genişliğinde ve 2x çözünürlükte üretilir (RESPONSIVE §3.5.2).

type ShareImageButtonProps = {
  targetId: string;
  fileName: string;
  title: string;
  disabled?: boolean;
  describedBy?: string;
  labels: { share: string; downloaded: string; failed: string };
};

const CARD_WIDTH = 358;

export function ShareImageButton({ targetId, fileName, title, disabled, describedBy, labels }: ShareImageButtonProps) {
  const toast = useToast();
  const [pending, setPending] = useState(false);

  async function share() {
    const node = document.getElementById(targetId);
    if (!node) return;
    setPending(true);
    try {
      const { toBlob } = await import("html-to-image");
      const blob = await toBlob(node, { pixelRatio: 2, width: CARD_WIDTH, style: { width: `${CARD_WIDTH}px`, maxWidth: "none", margin: "0" } });
      if (!blob) throw new Error("empty image");
      const file = new File([blob], fileName, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title });
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      toast({ message: labels.downloaded });
    } catch (error) {
      // Kullanıcı paylaşım penceresini kapattıysa hata gösterilmez.
      if (!(error instanceof DOMException && error.name === "AbortError")) toast({ message: labels.failed, tone: "error" });
    } finally {
      setPending(false);
    }
  }

  return (
    <Button leadingIcon="share" loading={pending} disabled={disabled} aria-describedby={describedBy} onClick={share}>
      {labels.share}
    </Button>
  );
}
