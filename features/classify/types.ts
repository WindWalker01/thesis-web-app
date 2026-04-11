export type ClassificationLabel = {
    label: string;
    score: number;
    index?: number;
};

export type ClassifyArtworkSuccessResult = {
    success: true;
    message: string;
    predictions: ClassificationLabel[];
};

export type ClassifyArtworkErrorResult = {
    success: false;
    message: string;
};

export type ClassifyArtworkResult =
    | ClassifyArtworkSuccessResult
    | ClassifyArtworkErrorResult;