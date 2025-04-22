import React, {useState} from "react";
import axios from "axios";
import {toast} from "react-toastify";
const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

const FileInput = ({image, onChange, onRemove}) => (
    <div className="flex px-4 h-[48px] relative mx-auto w-[420px] items-center justify-between text-gray-700 border border-gray-300 rounded-lg gap-2 mb-4">
        <input
            type="file"
            onChange={onChange}
            className="opacity-0 z-[100] absolute w-full h-full cursor-pointer bg-white p-2"
        />
        {!image ? (
        <>
        <img src="./src/assets/images/lens.png" alt="lens"
          className=" w-6 h-full end-4 absolute object-contain cursor-pointer "
          
          />
            <span className="text-sm text-en w-f text-gray-400">Upload an image</span>
          </>
        ) : (
            <>
                <span className="text-sm text-en w-f text-gray-700">{image.name}</span>
                <button
                    onClick={onRemove}
                    className="text-red-600 w-6 z-[999] end-4 absolute cursor-pointer hover:text-red-800 font-bold text-lg"
                    title="Remove image"
                >
                    ×
                </button>
            </>
        )}
    </div>
);

const ActionButton = ({onClick, disabled, loading, text, className}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`${className} ${
            disabled ? "" : "cursor-pointer"
        } text-white px-4 py-2 rounded-lg disabled:opacity-50`}
    >
        {loading ? `${text}ing...` : `${text}`}
    </button>
);

const ResultCard = ({result, index}) => (
    <div className="p-4 bg-white mx-auto rounded-lg w-[300px] shadow-md border border-gray-200 text-center">
        <img
            src={`${apiUrl}/${result.image}`}
            alt={`Result ${index + 1}`}
            className="rounded-md mb-3 w-full h-64 object-cover"
        />
        <p className="text-sm text-gray-600 font-medium">Score: {result.score.toFixed(3)}</p>
    </div>
);

const ImageSearch = () => {
    const [image, setImage] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
        setMessage("");
        setError(null);
    };

    const handleRemoveImage = () => setImage(null);

    const handleUpload = async () => {
        if (!image) return toast.warn("Please select an image first!");

        const formData = new FormData();
        formData.append("image", image);

        setUploading(true);

        try {
            await axios.post(`${apiUrl}/api/upload/`, formData, {
                headers: {"Content-Type": "multipart/form-data"},
            });
            toast.success("Image uploaded successfully!");
        } catch (err) {
            toast.error("Error uploading image.");
        } finally {
            setUploading(false);
        }
    };

    const handleSearch = async () => {
        if (!image) return toast.warn("Please select an image first!");

        const formData = new FormData();
        formData.append("image", image);

        setLoading(true);
        setResults([]);

        try {
            const response = await axios.post(`${apiUrl}/api/search/`, formData, {
                headers: {"Content-Type": "multipart/form-data"},
            });
            setResults(response.data);
            if (!response.data.length) toast.info("No similar images found.");
        } catch (err) {
            toast.error("Error fetching results.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full grid h-screen px-10 bg-white">
            <div className="rounded-xl p-8 mb-10 bg-gradient-to-r">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Visual Image Search</h1>

                <FileInput image={image} onChange={handleFileChange} onRemove={handleRemoveImage} />

                <div className="flex justify-center gap-4">
                    <ActionButton
                        onClick={handleUpload}
                        disabled={uploading || !image}
                        loading={uploading}
                        text="Upload Image"
                        className={"bg-green-600 hover:bg-green-700"}
                    />
                    <ActionButton
                        onClick={handleSearch}
                        disabled={loading || !image}
                        loading={loading}
                        text="Search Similar"
                        className={"bg-blue-600 hover:bg-blue-700"}
                    />
                </div>

                {message && <p className="text-green-600 mt-4 text-center">{message}</p>}
                {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

                {results?.length > 0 && (
                    <h2 className="text-2xl font-semibold mt-6 text-gray-800 text-center">Top Matches (Score > 0.6)</h2>
                )}
            </div>

            <div className="overflow-y-scroll [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:hidden">
                {results?.length > 0 ? (
                    <div className="grid grid-cols-1 jc sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {results?.map((result, index) => (
                            <ResultCard key={index} result={result} index={index} />
                        ))}
                    </div>
                ) : (
                    <img src="./src/assets/images/empty.jpg" alt="empty state" className="h-[50vh] mx-auto" />
                )}
            </div>
        </div>
    );
};

export default ImageSearch;
