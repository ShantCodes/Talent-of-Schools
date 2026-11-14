import { useEffect, useState } from "react";
import { getMediaPreview } from "../lib/api";
import { LoaderCircle, X } from "lucide-react";

export function ImagePreview({ mediaId }: { mediaId: number }) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);

    useEffect(() => {
        let objectUrl = '';

        getMediaPreview(mediaId)
            .then(result => {
                objectUrl = result.url;
                setUrl(result.url);
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [mediaId]);

    if (loading) {
        return <LoaderCircle className="h-5 w-5 animate-spin text-fg-subtle" />;
    }

    if (error || !url) {
        return <span className="text-fg-subtle">—</span>;
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setFullscreen(true)}
                className="block cursor-zoom-in overflow-hidden transition hover:opacity-80 rounded-xl"
            >
                <img
                    src={url}
                    alt="Document preview"
                    className="h-10 w-32 object-cover b rounded-xl"
                />
            </button>

            {fullscreen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
                    onClick={() => setFullscreen(false)}
                >
                    <button
                        type="button"
                        onClick={() => setFullscreen(false)}
                        className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                        aria-label="Close preview"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    <img
                        src={url}
                        alt="Full-size document preview"
                        className="max-h-[90vh] max-w-[95vw] rounded-lg object-contain"
                        onClick={e => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}