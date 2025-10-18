import { useRef, useState ,useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X,FileImage } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  // ===== GIF FUNCTIONALITY START =====
const [showGifPicker, setShowGifPicker] = useState(false);
const [gifs, setGifs] = useState([]);
const [gifSearchQuery, setGifSearchQuery] = useState("");
const [gifOffset, setGifOffset] = useState(0);
const [isLoadingGifs, setIsLoadingGifs] = useState(false);
const [selectedGifUrl, setSelectedGifUrl] = useState(null);
const gifContainerRef = useRef(null);
const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API;
const GIF_LIMIT = 6;
  // ===== GIF FUNCTIONALITY END =====

  // ===== GIF FUNCTIONS START =====
// Fetch GIFs (trending or search)
const fetchGifs = async (offset = 0, isNewSearch = false) => {
  if (isLoadingGifs) return;
  
  setIsLoadingGifs(true);
  try {
    const endpoint = gifSearchQuery.trim()
      ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${gifSearchQuery}&limit=${GIF_LIMIT}&offset=${offset}`
      : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=${GIF_LIMIT}&offset=${offset}`;

    const response = await fetch(endpoint);
    const data = await response.json();

    if (data.data) {
      if (isNewSearch) {
        setGifs(data.data);
      } else {
        setGifs(prev => [...prev, ...data.data]);
      }
      setGifOffset(offset);
    }
  } catch (error) {
    console.error("Failed to fetch GIFs:", error);
    toast.error("Failed to load GIFs");
  } finally {
    setIsLoadingGifs(false);
  }
};

// Initial fetch when GIF picker opens
useEffect(() => {
  if (showGifPicker && gifs.length === 0) {
    fetchGifs(0, true);
  }
}, [showGifPicker]);

// Search GIFs when query changes
useEffect(() => {
  if (showGifPicker) {
    const timer = setTimeout(() => {
      fetchGifs(0, true);
    }, 500);
    return () => clearTimeout(timer);
  }
}, [gifSearchQuery]);

// Handle scroll for infinite loading
const handleGifScroll = (e) => {
  const { scrollTop, scrollHeight, clientHeight } = e.target;
  if (scrollHeight - scrollTop <= clientHeight * 1.5 && !isLoadingGifs && gifOffset < 94) {
    fetchGifs(gifOffset + GIF_LIMIT, false);
  }
};

// Select GIF
const handleSelectGif = (gif) => {
  const gifUrl = gif.images.original.url;
  setSelectedGifUrl(gifUrl);
  setImagePreview(gifUrl);
  setShowGifPicker(false);
  setGifs([]);
  setGifSearchQuery("");
  setGifOffset(0);
};
// ===== GIF FUNCTIONS END =====

const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (!file.type.startsWith("image/")) {
    toast.error("Please select an image file");
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    setImagePreview(reader.result);
    setSelectedGifUrl(null); // ADDED: Clear GIF if image is selected
  };
  reader.readAsDataURL(file);
};

const removeImage = () => {
  setImagePreview(null);
  setSelectedGifUrl(null); // ADDED: Also clear GIF URL
  if (fileInputRef.current) fileInputRef.current.value = "";
};

const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!text.trim() && !imagePreview) return;

  try {
    await sendMessage({
      text: text.trim(),
      image: imagePreview, // Contains either image data URL or GIF URL
   
    });

    // Clear form
    setText("");
    setImagePreview(null);
    setSelectedGifUrl(null); // ADDED: Clear GIF URL
    if (fileInputRef.current) fileInputRef.current.value = "";
  } catch (error) {
    console.error("Failed to send message:", error);
  }
};

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}
      {/* ===== GIF PICKER MODAL START ===== */}
{showGifPicker && (
  <div className="mb-3 border border-zinc-700 rounded-lg bg-base-200 p-3">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-semibold">Select a GIF</h3>
      <button
        onClick={() => {
          setShowGifPicker(false);
          setGifs([]);
          setGifSearchQuery("");
          setGifOffset(0);
        }}
        className="btn btn-ghost btn-xs"
        type="button"
      >
        <X className="size-4" />
      </button>
    </div>
    
    <input
      type="text"
      className="w-full input input-bordered input-sm mb-3"
      placeholder="Search GIFs..."
      value={gifSearchQuery}
      onChange={(e) => setGifSearchQuery(e.target.value)}
    />

    <div
      ref={gifContainerRef}
      onScroll={handleGifScroll}
      className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 sm:max-h-80 overflow-y-auto"
    >
      {gifs.map((gif) => (
        <button
          key={gif.id}
          type="button"
          onClick={() => handleSelectGif(gif)}
          className="relative aspect-square overflow-hidden rounded-lg hover:opacity-80 transition-opacity"
        >
          <img
            src={gif.images.fixed_height_small.url}
            alt={gif.title}
            className="w-full h-full object-cover"
          />
        </button>
      ))}
    </div>

    {isLoadingGifs && (
      <div className="text-center py-2">
        <span className="loading loading-spinner loading-sm"></span>
      </div>
    )}

    {gifOffset >= 94 && (
      <div className="text-center py-2 text-xs text-zinc-500">
        Maximum GIFs loaded (100)
      </div>
    )}
  </div>
)}
{/* ===== GIF PICKER MODAL END ===== */}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>

          {/* ===== GIF BUTTON START ===== */}
<button
  type="button"
  className={`hidden sm:flex btn btn-circle
           ${showGifPicker ? "text-emerald-500" : "text-zinc-400"}`}
  onClick={() => setShowGifPicker(!showGifPicker)}
>
  <span className="font-bold text-sm">GIF</span>
</button>

{/* ===== GIF BUTTON END ===== */}
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;