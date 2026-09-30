"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { notify } from "@/lib/utils/toast";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateImageFile(file: File): string | null {
  if (!IMAGE_TYPES.has(file.type)) return "Usa una imagen PNG, JPG o WebP.";
  if (file.size > MAX_IMAGE_BYTES) return "La imagen no puede superar 5 MB.";
  return null;
}

interface ImageUploadButtonProps {
  bucket: "logos-negocios" | "avatars-profesionales";
  path: string;
  onUploaded: (url: string) => void;
  label: string;
  disabled?: boolean;
}

export function ImageUploadButton({
  bucket,
  path,
  onUploaded,
  label,
  disabled = false,
}: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      notify.warning("Imagen no válida", validationError);
      return;
    }

    setUploading(true);
    try {
      const storage = createClient().storage.from(bucket);
      const { error } = await storage.upload(path, file, {
        contentType: file.type,
        upsert: true,
      });
      if (error) throw error;

      onUploaded(storage.getPublicUrl(path).data.publicUrl);
      notify.success("Imagen cargada");
    } catch (error) {
      notify.error(
        "No se pudo cargar la imagen",
        error instanceof Error ? error.message : "Intenta de nuevo.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        isLoading={uploading}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        {!uploading && <Upload className="size-4" aria-hidden="true" />}
        {label}
      </Button>
    </>
  );
}
