// Icons
import { FaDownload, FaCopy, FaRedo } from 'react-icons/fa';

const ImageActions = ({ downloadAsPNG, copyLinkDrawing, redrawSketch, copyMessage }) => (
    <>
        <FaDownload
            className="absolute bottom-0 right-0 text-gray-500 hover:text-black text-3xl mb-4 mr-28 cursor-pointer"
            onClick={downloadAsPNG}
            title="Download as PNG"
        />
        <FaCopy
            className="absolute bottom-0 right-0 text-gray-500 hover:text-black text-3xl mb-4 mr-16 cursor-pointer"
            onClick={copyLinkDrawing}
            title="Copy to clipboard"
        />
        <FaRedo
            className="absolute bottom-0 right-0 text-gray-500 hover:text-black text-3xl mb-4 mr-4 cursor-pointer"
            onClick={redrawSketch}
            title="Redraw Sketch"
        />
        {copyMessage.length > 0 && (
            <div className="absolute bottom-0 left-0 mb-4 ml-8 text-white bg-green-500 px-2 py-1 rounded">
                {copyMessage}
            </div>
        )}
    </>
);

export default ImageActions;
