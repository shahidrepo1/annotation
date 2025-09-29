import axios from "axios";

// export const baseServiceUrl = import.meta.env.VITE_BASE_SERVICE_URL;
export const backendServiceUrl = import.meta.env.VITE_BACKEND_URL as string;

// sr api's url

export const fileUploadUrl = `${backendServiceUrl}sr/api/audio/process/`;
export const updateSpeakerUrl = `${backendServiceUrl}sr/api/speaker/update/`;
export const addPersonUrl = `${backendServiceUrl}sr/api/labels/add/`;
export const getAudioChunks = `${backendServiceUrl}sr/api/get-audio-chunks/`;
export const getAllAudioChunksUrl = `${backendServiceUrl}sr/api/get_all_audio-chunks/`;
export const deleteAudioUrl = `${backendServiceUrl}sr/api/delete-chunk/`;
export const approveSrDataUrl = `${backendServiceUrl}sr/api/do-annotate/`;
export const srTrainModelUrl = `${backendServiceUrl}sr/api/train-model/`;
export const srTrainedDataUrl = `${backendServiceUrl}sr/api/get-training-progress/`;

//stt api's url
export const sttFileUpload = `${backendServiceUrl}stt/process/`;
export const sttChunksEdit = `${backendServiceUrl}stt/chunks/edit/`;
export const deleteSttChunk = `${backendServiceUrl}stt/chunks/delete/`;
export const classifySttChunk = `${backendServiceUrl}stt/classify_chunks/`;
export const getSttChunks = `${backendServiceUrl}stt/get-chunks/`;
export const approveSttData = `${backendServiceUrl}stt/annotate-audio/`;
export const sttTrainModel = `${backendServiceUrl}stt/train_stt/`;
export const sttGetTrainedData = `${backendServiceUrl}stt/get_stt_training_progress/`;

// logo detection api's url
export const logoFileUpload = `${backendServiceUrl}logo/api/upload/`;
export const logoAnnotate = `${backendServiceUrl}logo/api/annotate/`;
export const logoLabel = `${backendServiceUrl}logo/api/save_label/`;
export const getLabels = `${backendServiceUrl}logo/api/get_label/`;
export const getLogoAnnotatedImage = `${backendServiceUrl}logo/api/annotated-images/`;
export const logoTrainModel = `${backendServiceUrl}logo/api/train_logo/`;
export const logoGetTrainedData = `${backendServiceUrl}logo/api/get_chunks/`;
export const logoDeleteImage = `${backendServiceUrl}logo/api/delete_labels/`;

//fr api's url
export const frFileUpload = `${backendServiceUrl}fr/process-image/`;
export const processedImage = `${backendServiceUrl}fr/update-processed-image/`;
export const frAddLabel = `${backendServiceUrl}fr/add-label/`;
export const getFrLabels = `${backendServiceUrl}fr/label-list/`;
export const getProccessedImages = `${backendServiceUrl}fr/get-all-prossessed-images/`;
export const deleteFrImage = `${backendServiceUrl}fr/delete-processed-image/`;
export const frTrainModel = `${backendServiceUrl}fr/train/`;
export const frGetTrainedData = `${backendServiceUrl}fr/get-training-progress/`;

//AD- frame api's url
export const adFileUpload = `${backendServiceUrl}ad/process-video/`;
export const adAddLabel = `${backendServiceUrl}ad/add-label/`;
export const getAdLabels = `${backendServiceUrl}ad/labels/`;
export const updateAdChunks = `${backendServiceUrl}ad/update-chunks/`;
export const getAdSegments = `${backendServiceUrl}ad/video/segments/`;
export const adDeleteChunk = `${backendServiceUrl}ad/delete-chunk/`;
export const adTrainVideo = `${backendServiceUrl}ad/train-video/`;
export const adGetTrainedData = `${backendServiceUrl}ad/get-training-progress/`;

//AD - Audio api's url
export const adAudioFileUpload = `${backendServiceUrl}ad/process-audio/`;
export const getAdAudioSegments = `${backendServiceUrl}ad/audio/segments/`;
export const adTrainAudio = `${backendServiceUrl}ad/train-audio/`;

//Ticker and flasher api's url
export const tickerFileUpload = `${backendServiceUrl}tf/process/`;
export const tfprocessedImage = `${backendServiceUrl}tf/update-processed-image/`;
export const getTfLabels = `${backendServiceUrl}tf/label-list/`;
export const getTfProcessedImages = `${backendServiceUrl}tf/get-all-processed-images/`;
export const tfTrainModel = `${backendServiceUrl}tf/train/`;
export const tfGetTrainedData = `${backendServiceUrl}tf/get-training-progress`;

// Object Detection api's url
export const objectDetectionFileUpload = `${backendServiceUrl}od/process/`;
export const odProcessedImage = `${backendServiceUrl}od/update-processed-image/`;
export const getOdProcessedImages = `${backendServiceUrl}od/get-all-processed-images/`;
export const getOdLabels = `${backendServiceUrl}od/label-list/`;
export const addOdLabel = `${backendServiceUrl}od/add-label/`;
export const odTrainModel = `${backendServiceUrl}od/train/`;
export const odGetTrainedData = `${backendServiceUrl}od/get-training-progress`;

// Sentiment Analysis
export const sentimentFileUpload = `${backendServiceUrl}sentiment/process/`;
export const getLabelsSentiment = `${backendServiceUrl}sentiment/label-list/`;
export const updateSentiment = `${backendServiceUrl}sentiment/update-sentiment/`;
export const deleteLabelSentiment = `${backendServiceUrl}sentiment/delete/`;
export const getSentiments = `${backendServiceUrl}sentiment/get-all-sentiment/`;
export const sentimentTrainModel = `${backendServiceUrl}sentiment/train/`;
export const sentimentGetTrainedData = `${backendServiceUrl}sentiment/get-training-progress`;

//OCR - Urdu Media
export const ocrFileUpload = `${backendServiceUrl}ocr/process-urdu-media/`;
export const updateOcrMedia = `${backendServiceUrl}ocr/frames/update/`;
export const deleteOcrMedia = `${backendServiceUrl}ocr/soft-delete-frame/`;
export const getOcrDataByDate = `${backendServiceUrl}ocr/get-all-dates-urdu-media/`;
export const getAllOcrMediaData = `${backendServiceUrl}ocr/urdu-media/by-date/`;
export const trainUrduMedia = `${backendServiceUrl}ocr/train-urdu-media/`;
export const getUrduMediaTrainedData = `${backendServiceUrl}ocr/get-urdu-media-training-progress/`;

//OCR - Urdu Document
export const ocrDocFileUpload = `${backendServiceUrl}ocr/process-urdu-document/`;
export const updateOcrDoc = `${backendServiceUrl}ocr/documetn/update/`;
export const deleteOcrDoc = `${backendServiceUrl}ocr/delete-urdu-document/`;
export const getOcrDocDataByDate = `${backendServiceUrl}ocr/get-all-dates-urdu-document/`;
export const getAllOcrDocData = `${backendServiceUrl}ocr/urdu-document/by-date/`;
export const trainUrduDoc = `${backendServiceUrl}ocr/train-urdu-document/`;
export const getUrduDocTrainedData = `${backendServiceUrl}ocr/get-urdu-doc-training-progress/`;

// auth
export const loginUrl = `${backendServiceUrl}account/login/`;
export const refreshUrl = `${backendServiceUrl}account/refresh/`;
export const logoutUrl = `${backendServiceUrl}account/logout/`;

export const axiosInstance = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
