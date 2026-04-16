"use client";
import React, { useRef, useState, useEffect } from "react";
import {
    Image as ImageIcon,
    Crop,
    Expand,
    Image as ImageUpscale, // no lucide-react upscale, using Image icon
    ImageMinus,
    Loader2Icon,
    CircleX,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import ImageKit from "imagekit";
import { toast } from "sonner";

type Props = {
    selectedEl: HTMLImageElement;
    clearSelection: any
};

const transformOptions = [
    { label: "Smart Crop", value: "smartcrop", icon: <Crop />, tranformation: 'fo-auto' },
    { label: "Resize", value: "resize", icon: <Expand />, tranformation: 'e-droupshadow' },
    { label: "Upscale", value: "upscale", icon: <ImageUpscale />, tranformation: 'e-upscale' },
    { label: "BG Remove", value: "bgremove", icon: <ImageMinus />, tranformation: 'e-bgremove' },
];

console.log("process.env.NEXT_PUBLIC_VITE_IMAGEKIT_PUBLIC_KEY", process.env.NEXT_PUBLIC_VITE_IMAGEKIT_PUBLIC_KEY);


var imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_VITE_IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.NEXT_PUBLIC_VITE_IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
});

function ImageSettingSection({ selectedEl, clearSelection }: Props) {
    const [altText, setAltText] = useState(selectedEl.alt || "");
    const [width, setWidth] = useState<number>(selectedEl.width || 300);
    const [height, setHeight] = useState<number>(selectedEl.height || 200);
    const [borderRadius, setBorderRadius] = useState(
        selectedEl.style.borderRadius || "0px"
    );
    const [selectedImage, setSelectedImage] = useState<File>()
    const [preview, setPreview] = useState<any>(selectedEl.src || "");
    const [activeTransforms, setActiveTransforms] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [loading, setloading] = useState<boolean>(false)

    useEffect(() => {
        if (selectedEl) {
            setAltText(selectedEl.alt || "");
            setWidth(selectedEl.width || 300);
            setHeight(selectedEl.height || 200);
            setBorderRadius(selectedEl.style.borderRadius || "0px");
            setPreview(selectedEl.src || "");
            setActiveTransforms([]);
        }
    }, [selectedEl])

    // Toggle transform
    const toggleTransform = (value: string) => {
        setActiveTransforms((prev) =>
            prev.includes(value)
                ? prev.filter((t) => t !== value)
                : [...prev, value]
        );
    };



    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file)
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveUploadedFile = async () => {
        if (selectedImage) {
            setloading(true)
            setloading(true)
            try {
                // Check if ImageKit is configured
                if (imagekit && process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
                    const imageRef = await imagekit.upload({
                        //@ts-ignore
                        file: selectedImage,
                        fileName: Date.now() + ".png",
                        isPublished: true
                    })
                    //@ts-ignore
                    selectedEl.setAttribute('src', imageRef.url + "?tr=")
                } else {
                    // Fallback to local Data URI if no backend storage configured
                    // This is temporary but fixes usage.
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        if (reader.result) {
                            selectedEl.setAttribute('src', reader.result as string);
                        }
                    };
                    reader.readAsDataURL(selectedImage);
                    toast.warning("ImageKit not configured. Using local preview.");
                }
            } catch (e) {
                toast.error("Upload failed");
            }
            setloading(false)
        } else {
            toast.error("Before Upload select the image")
        }

    }


    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    const GenerateAiImage = () => {
        setloading(true)

        const url = `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${altText}/${Date.now()}.png?tr=`
        setPreview(url)
        //@ts-ignore
        selectedEl.setAttribute('src', url)
    }

    const ApplyTransformation = (trValue: string) => {
        setloading(true)
        if (!preview.includes(trValue)) {
            const url = preview + trValue + ','
            setPreview(url)
            //@ts-ignore
            selectedEl.setAttribute('src', url)
        } else {
            const url = preview.replaceAll(trValue + ",", "")
            setPreview(url)
            //@ts-ignore
            selectedEl.setAttribute('src', url)
        }
    }

    return (
        <div className="w-96 shadow p-4 space-y-4">
            <h2 className="flex items-center justify-between font-bold">
                <span className="flex gap-2 items-center">
                    <ImageIcon /> Image Settings
                </span>

                <CircleX className="cursor-pointer" onClick={clearSelection} />
            </h2>

            {/* Preview (clickable) */}
            <div className="flex justify-center">
                <img
                    src={preview}
                    alt={altText}
                    className="max-h-40 object-contain border rounded cursor-pointer hover:opacity-80"
                    onClick={openFileDialog}
                    onLoad={() => setloading(false)}
                />
            </div>

            {/* Hidden file input */}
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            {/* Upload Button */}
            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={saveUploadedFile}
                disabled={loading}
            >
                {loading && <Loader2Icon className="animate-spin" />}
                Upload Image
            </Button>

            {/* Alt text */}
            <div>
                <label className="text-sm">Prompt</label>
                <Input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Enter alt text"
                    className="mt-1"
                />
            </div>

            <Button className="w-full" disabled={loading} onClick={GenerateAiImage}>
                {loading && <Loader2Icon className="animate-spin" />} Generate AI Image
            </Button>

            {/* Transform Buttons */}
            <div>
                <label className="text-sm mb-1 block">AI Transform</label>
                <div className="flex gap-2 flex-wrap">
                    <TooltipProvider>
                        {transformOptions.map((opt) => {
                            const applied = activeTransforms.includes(opt.value);
                            return (
                                <Tooltip key={opt.value}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            variant={preview.includes(opt.tranformation) ? "default" : "outline"}
                                            className="flex items-center justify-center p-2"
                                            onClick={() => ApplyTransformation(opt.tranformation)}
                                        >
                                            {opt.icon}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {opt.label} {applied && "(Applied)"}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </TooltipProvider>
                </div>
            </div>

            {/* Conditional Resize Inputs */}
            {activeTransforms.includes("resize") && (
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="text-sm">Width</label>
                        <Input
                            type="number"
                            value={width}
                            onChange={(e) => setWidth(Number(e.target.value))}
                            className="mt-1"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-sm">Height</label>
                        <Input
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(Number(e.target.value))}
                            className="mt-1"
                        />
                    </div>
                </div>
            )}

            {/* Border Radius */}
            <div>
                <label className="text-sm">Border Radius</label>
                <Input
                    type="text"
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(e.target.value)}
                    placeholder="e.g. 8px or 50%"
                    className="mt-1"
                />
            </div>
        </div>
    );
}

export default ImageSettingSection;

