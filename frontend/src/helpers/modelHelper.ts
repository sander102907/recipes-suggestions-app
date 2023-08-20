import cv, { MatVector, resize, RotatedRect, Size } from "@techstark/opencv-js";
import {
    argMax,
    browser,
    concat,
    GraphModel,
    loadGraphModel,
    Rank,
    scalar,
    softmax,
    squeeze,
    Tensor,
    tensor,
    Tensor3D,
    unstack,
    zeros
} from "@tensorflow/tfjs";
import { MutableRefObject } from "react";

// Detection config
const DET_MEAN = 0.785;
const DET_STD = 0.275;

const DET_CONFIG = {
    value: "db_mobilenet_v2",
    label: "DB (MobileNet V2)",
    height: 512,
    width: 512,
    path: "models/db_mobilenet_v2/model.json"
};

// Recognition config
const REC_MEAN = 0.694;
const REC_STD = 0.298;

const RECO_CONFIG = {
    value: "crnn_mobilenet_v2",
    label: "CRNN (MobileNet V2)",
    height: 32,
    width: 128,
    path: "models/crnn_mobilenet_v2/model.json",
};

const VOCAB = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~°£€¥¢฿àâéèêëîïôùûüçÀÂÉÈÊËÎÏÔÙÛÜÇ";

export const loadRecognitionModel = async ({
    recognitionModel
}: {
    recognitionModel: MutableRefObject<GraphModel | null>;
}) => {
    try {
        recognitionModel.current = await loadGraphModel(RECO_CONFIG.path);
    } catch (error) {
        console.log(error);
    }
};

export const loadDetectionModel = async ({
    detectionModel,
}: {
    detectionModel: MutableRefObject<GraphModel | null>;
}) => {
    try {
        detectionModel.current = await loadGraphModel(DET_CONFIG.path);
    } catch (error) {
        console.log(error);
    }
};

export const getImageTensorForRecognitionModel = async (
    crops: HTMLCanvasElement[],
    size: [number, number]
) => {
    const dates: Date[] = [];

    // @ts-ignore
    const list = crops.map((imageObject) => {
        let h = imageObject.height;
        let w = imageObject.width;
        let resize_target: any;
        let padding_target: any;
        let aspect_ratio = size[1] / size[0];
        if (aspect_ratio * h > w) {
            resize_target = [size[0], Math.round((size[0] * w) / h)];
            padding_target = [
                [0, 0],
                [0, size[1] - Math.round((size[0] * w) / h)],
                [0, 0],
            ];
        } else {
            resize_target = [Math.round((size[1] * h) / w), size[1]];
            padding_target = [
                [0, size[0] - Math.round((size[1] * h) / w)],
                [0, 0],
                [0, 0],
            ];
        }

        dates.push(new Date());

        return browser.fromPixels(imageObject)
            .resizeNearestNeighbor(resize_target)
            .pad(padding_target, 0)
            .toFloat()
            .expandDims();
    });
    console.log(list);

    // console.log("crops process times :" + dates[0], dates[-1]);

    const imageTensor = concat(list);
    console.log(imageTensor.shape);
    let mean = scalar(255 * REC_MEAN);
    let std = scalar(255 * REC_STD);
    return imageTensor.sub(mean).div(std);
};

export const getImageTensorForDetectionModel = (
    imageTensor: Tensor<Rank>,
    size: [number, number]
) => {
    let tensor = imageTensor
        .resizeNearestNeighbor(size)
        .toFloat();
    let mean = scalar(255 * DET_MEAN);
    let std = scalar(255 * DET_STD);
    return tensor.sub(mean).div(std).expandDims();
};

export const extractLinesFromCrops = async ({
    recognitionModel,
    crops,
}: {
    recognitionModel: GraphModel | null;
    crops: {
        canvas: HTMLCanvasElement;
        line: number;
    }[];
}) => {
    console.log('get image tensor for reco model: ' + new Date());
    let tensor = await getImageTensorForRecognitionModel(crops.map(crop => crop.canvas), [RECO_CONFIG.height, RECO_CONFIG.width]);
    console.log('before reco prediction: ' + new Date());
    let predictions = await recognitionModel!.executeAsync(tensor);
    console.log("reco model predicted: " + new Date());

    // @ts-ignore
    let probabilities = softmax(predictions, -1);
    let bestPath = unstack(argMax(probabilities, -1), 0);

    let currentLine = 0;
    let index = 0;
    const blank = 126;
    const lines = [];
    let line = [];

    for (const sequence of bestPath) {
        if (crops[index].line > currentLine) {
            lines.push(line);
            line = [];
            currentLine++;
        }

        let collapsed = "";
        let added = false;
        const values = sequence.dataSync();
        const arr = Array.from(values);
        for (const k of arr) {
            if (k === blank) {
                added = false;
            } else if (k !== blank && added === false) {
                collapsed += VOCAB[k];
                added = true;
            }
        }
        line.push(collapsed);
        index++;
    }

    lines.push(line);

    return lines;
};

export const getHeatMapFromImage = async ({
    detectionModel,
    image,
}: {
    detectionModel: GraphModel;
    image: cv.Mat;
}) => {
    const imageTensor = tensor(image.data, [image.rows, image.cols, 3]);

    const imageTensorInp = getImageTensorForDetectionModel(imageTensor, [DET_CONFIG.height, DET_CONFIG.width]);
    let prediction = await detectionModel.executeAsync(imageTensorInp);
    console.log("det model predicted");
    // @ts-ignore
    prediction = squeeze(prediction, 0);
    if (Array.isArray(prediction)) {
        prediction = prediction[0];
    }
    // @ts-ignore
    const pixels = await browser.toPixels(prediction);

    return cv.matFromImageData({
        data: pixels,
        width: DET_CONFIG.width,
        height: DET_CONFIG.height
    });
}

function clamp(number: number, size: number) {
    return Math.max(0, Math.min(number, size));
}

export const transformBoundingBox = (
    contour: any,
    size: [number, number]
): cv.Rect => {
    let offset =
        (contour.width * contour.height * 1) /
        (2 * (contour.width + contour.height));
    const p1 = clamp(contour.x - offset, size[1]) - 1;
    const p2 = clamp(p1 + contour.width + 2 * offset, size[1]) - 1;
    const p3 = clamp(contour.y - offset, size[0]) - 1;
    const p4 = clamp(p3 + contour.height + 2 * offset, size[0]) - 1;

    return new cv.Rect(p1, p3, p2 - p1, p4 - p3);
};

export const extractBoundingBoxesFromHeatmap = (heatmap: cv.Mat, width: number, height: number): cv.Rect[] => {
    cv.resize(heatmap, heatmap, new cv.Size(width, height));

    // const canvas = document.createElement("canvas");
    // document.body.append(canvas);
    // cv.imshow(canvas, heatmap);

    cv.cvtColor(heatmap, heatmap, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(heatmap, heatmap, 10, 255, cv.THRESH_BINARY);
    cv.morphologyEx(heatmap, heatmap, cv.MORPH_OPEN, cv.Mat.ones(2, 2, cv.CV_8U));
    cv.dilate(heatmap, heatmap, cv.Mat.ones(3, 3, cv.CV_8U), new cv.Point(-1, -1), 2);

    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();

    // const canvas2 = document.createElement("canvas");
    // document.body.append(canvas2);
    // cv.imshow(canvas2, heatmap);

    cv.findContours(
        heatmap,
        contours,
        hierarchy,
        cv.RETR_EXTERNAL,
        cv.CHAIN_APPROX_SIMPLE
    );

    // draw contours with random Scalar
    const boundingBoxes = [];
    // @ts-ignore
    for (let i = 0; i < contours.size(); ++i) {
        const contourBoundingBox = cv.boundingRect(contours.get(i));

        if (contourBoundingBox.width > 2 && contourBoundingBox.height > 2) {
            boundingBoxes.push(transformBoundingBox(contourBoundingBox, [height, width]));
        }
    }

    contours.delete();
    hierarchy.delete();
    heatmap.delete();

    sortBoundingBoxes(boundingBoxes);
    return boundingBoxes;
};

const sortBoundingBoxes = (boundingBoxes: cv.Rect[]) => {
    boundingBoxes.sort((a, b) => {
        if (a.y < b.y - 0.2 * b.height) {
            return -1;
        }

        if (a.y > b.y + 0.2 * b.height) {
            return 1;
        }

        return a.x < b.x ? -1 : 1;
    });
}

export const getCrops = async (image: cv.Mat, boundingBoxes: cv.Rect[]) => {
    const crops = [];
    let line = 0;

    for (let i = 0; i < boundingBoxes.length; i++) {
        const crop = image.roi(boundingBoxes[i]);
        const canvas = document.createElement("canvas");
        canvas.classList.add("crop");
        document.body.append(canvas);
        cv.imshow(canvas, crop);

        if (i > 0 && boundingBoxes[i].y > boundingBoxes[i - 1].y + 0.6 * boundingBoxes[i - 1].height) {
            line++;
        }

        crops.push({
            canvas: canvas,
            line: line
        });
    }

    return crops;
}

export const transformTopDownView = (image: HTMLImageElement) => {
    const src = cv.imread(image);
    const dst = src.clone();

    let dim_limit = 1080;
    let max_dim = Math.max(src.cols, src.rows);
    let resize_scale = 1;

    if (max_dim > dim_limit) {
        resize_scale = dim_limit / max_dim;
        cv.resize(src, dst, new cv.Size(0, 0), resize_scale, resize_scale);
    }

    const kernel = cv.Mat.ones(5, 5, cv.CV_8U);
    cv.morphologyEx(dst, dst, cv.MORPH_CLOSE, kernel, new cv.Point(-1, -1), 3);

    cv.cvtColor(dst, dst, cv.COLOR_BGR2GRAY);
    cv.GaussianBlur(dst, dst, new cv.Size(11, 11), 0);

    cv.Canny(dst, dst, 0, 50);
    cv.dilate(dst, dst, cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(5, 5)));

    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();

    cv.findContours(
        dst,
        contours,
        hierarchy,
        cv.RETR_LIST,
        cv.CHAIN_APPROX_NONE
    );

    //Get area for all contours so we can find the biggest
    let sortableContours = [];

    // @ts-ignore
    for (let i = 0; i < contours.size(); i++) {
        let cnt = contours.get(i);
        let area = cv.contourArea(cnt, false);
        let perim = cv.arcLength(cnt, false);

        sortableContours.push({ areaSize: area, perimiterSize: perim, contour: cnt, index: i });
    }

    sortableContours = sortableContours.sort((item1, item2) => { return (item1.areaSize > item2.areaSize) ? -1 : (item1.areaSize < item2.areaSize) ? 1 : 0; });

    const rect = cv.minAreaRect(sortableContours[0].contour);

    cv.drawContours(dst, contours, sortableContours[0].index, new cv.Scalar(100, 100, 100), 10, cv.LINE_8, hierarchy, 100);

    const x = dst.clone();
    cv.rectangle(x, new cv.Point(rect.center.x - rect.size.width / 2, rect.center.y - rect.size.height / 2), new cv.Point(rect.center.x + rect.size.width / 2, rect.center.y + rect.size.height / 2), new cv.Scalar(100, 100, 100));

    const canvas2 = document.createElement("canvas");
    document.body.append(canvas2);
    cv.imshow(canvas2, x);

    let angle = rect.angle;

    if (rect.size.height > rect.size.width) {
        angle += 90;
        const width = rect.size.width;
        rect.size.width = rect.size.height;
        rect.size.height = width;
    }

    console.log(angle);

    angle = angle * Math.PI / 180;

    // Rotate image
    const M = cv.getRotationMatrix2D(new cv.Point(dst.cols / 2, dst.rows / 2), rect.angle, 1);
    cv.warpAffine(dst, dst, M, new cv.Size(dst.cols, dst.rows));

    // Rotate bounding box
    // const rotatedRect = new cv.Rect()
    const topleft = new cv.Point(
        rect.center.x - ((rect.size.width / 2) * Math.cos(angle)) - ((rect.size.height / 2) * Math.sin(angle)),
        rect.center.y - ((rect.size.width / 2) * Math.sin(angle)) + ((rect.size.height / 2) * Math.cos(angle))
    );

    const bottomright = new cv.Point(
        rect.center.x + ((rect.size.width / 2) * Math.cos(angle)) + ((rect.size.height / 2) * Math.sin(angle)),
        rect.center.y + ((rect.size.width / 2) * Math.sin(angle)) - ((rect.size.height / 2) * Math.cos(angle))
    );

    const bottomleft = new cv.Point(
        rect.center.x - ((rect.size.width / 2) * Math.cos(angle)) + ((rect.size.height / 2) * Math.sin(angle)),
        rect.center.y + ((rect.size.width / 2) * Math.sin(angle)) - ((rect.size.height / 2) * Math.cos(angle))
    );

    cv.circle(dst, topleft, 10, new cv.Scalar(100, 100, 100));
    cv.circle(dst, bottomright, 10, new cv.Scalar(100, 100, 100));
    cv.circle(dst, bottomleft, 10, new cv.Scalar(100, 100, 100));
    cv.circle(dst, new cv.Point(rect.center.x, rect.center.y), 10, new cv.Scalar(100, 100, 100));

    console.log(rect, topleft, Math.cos(rect.angle * Math.PI / 180), Math.sin(rect.angle));

    console.log(resize_scale);


    const receipt = src.roi(new cv.Rect(new cv.Point(topleft.x / resize_scale, topleft.y / resize_scale), new cv.Size((bottomright.x - topleft.x) / resize_scale, (bottomright.y - topleft.y) / resize_scale)));

    // const receipt = src_resized.roi(new cv.Rect(topleft, new cv.Size(bottomright.x - topleft.x, bottomright.y - topleft.y)));
    cv.rectangle(dst, topleft, bottomright, new cv.Scalar(100, 100, 100));

    const receiptDst = receipt.clone();

    cv.cvtColor(receiptDst, receiptDst, cv.COLOR_BGR2GRAY);
    // cv.threshold(receiptDst, receiptDst, 160, 255, cv.THRESH_BINARY_INV);
    cv.adaptiveThreshold(receiptDst, receiptDst, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 21, 5);

    const receiptDst2 = receiptDst.clone();
    let out = new cv.Mat();

    const kernel1 = cv.Mat.ones(3, 5, cv.CV_8U);
    const kernel2 = cv.Mat.ones(9, 9, cv.CV_8U);
    const lines = new cv.Mat();

    cv.erode(receiptDst, receiptDst2, kernel1, new cv.Point(-1, -1), 1);
    cv.dilate(receiptDst2, receiptDst2, kernel2, new cv.Point(-1, -1), 3);
    cv.bitwise_and(receiptDst, receiptDst2, receiptDst2);
    cv.bitwise_not(receiptDst2, out);
    // cv.bitwise_and(receiptDst, receiptDst, receiptDst2, receiptDst2);

    cv.dilate(receiptDst2, receiptDst2, cv.Mat.ones(3, 9, cv.CV_8U), new cv.Point(-1, -1), 1);

    dim_limit = 4000;
    max_dim = Math.max(receiptDst2.cols, receiptDst2.rows);

    if (max_dim > dim_limit) {
        resize_scale = dim_limit / max_dim;
        cv.resize(receiptDst2, receiptDst2, new cv.Size(0, 0), resize_scale, resize_scale);
    }

    cv.HoughLinesP(receiptDst2, lines, 1, Math.PI / 180, 10, receiptDst2.cols / 4, 20);

    let highestPoint = receiptDst2.rows;
    let lowestPoint = 0;

    for (let i = 0; i < lines.rows; ++i) {
        let startPoint = new cv.Point(lines.data32S[i * 4], lines.data32S[i * 4 + 1]);
        let endPoint = new cv.Point(lines.data32S[i * 4 + 2], lines.data32S[i * 4 + 3]);

        if (
            startPoint.y < endPoint.y + 10 && startPoint.y > endPoint.y - 10 && // Filter out vertical lines
            startPoint.y > receiptDst2.rows * 0.1 && startPoint.y < receiptDst2.rows - (receiptDst2.rows * 0.1) // Filter out lines that are too close to the top or bottom of the image
        ) {

            cv.line(receiptDst2, startPoint, endPoint, new cv.Scalar(200, 150, 150), 30);

            if (Math.min(startPoint.y, endPoint.y) < highestPoint) {
                highestPoint = Math.min(startPoint.y, endPoint.y);
            }

            if (Math.max(startPoint.y, endPoint.y) > lowestPoint) {
                lowestPoint = Math.max(startPoint.y, endPoint.y);
            }
        }
    }

    // out = out.roi(new cv.Rect(new cv.Point(0, highestPoint), new cv.Size(receiptDst2.cols, lowestPoint - highestPoint + out.cols * 0.06)));


    const canvas = document.createElement("canvas");
    document.body.append(canvas);
    cv.imshow(canvas, dst);

    const canvas3 = document.createElement("canvas");
    document.body.append(canvas3);
    cv.imshow(canvas3, receipt);

    const canvas4 = document.createElement("canvas");
    document.body.append(canvas4);
    cv.imshow(canvas4, receiptDst2);

    const outCanvas = document.createElement("canvas");
    document.body.append(outCanvas);
    cv.imshow(outCanvas, out);

    cv.cvtColor(out, out, cv.COLOR_GRAY2RGB);
    // const imageData = cv.toImageData(out);
    // const outImage = new Image(imageData.width, imageData.height);

    return out;
    // return outCanvas;
}

interface ReceiptProduct {
    amount?: number;
    name: string;
    price?: number;
    totalPrice?: number;
}

export const processLines = (lines: string[][]) => {
    const products = [];

    for (const line of lines) {
        const prod: ReceiptProduct = {
            name: ""
        };

        if (!isNaN(parseInt(line[0]))) {
            prod.amount = parseInt(line[0]);
        } else {
            prod.name += line[0] + " ";
        }

        for (let i = 1; i < line.length; i++) {
            if (line[i].includes("%")) {
                break;
            }

            if (!isNaN(parseFloat(line[i].replace(/,/, '.')))) {
                if (i < line.length - 1 && !isNaN(parseFloat(line[i + 1])) && !line[i + 1].includes("%")) {
                    prod.price = parseFloat(line[i].replace(/,/, '.'));
                    prod.totalPrice = parseFloat(line[i + 1].replace(/,/, '.'));
                } else {
                    prod.totalPrice = parseFloat(line[i].replace(/,/, '.'));
                }

                break;
            }

            prod.name += line[i] + " ";
        }

        if (prod.totalPrice !== undefined || (prod.amount !== undefined && prod.price !== undefined)) {
            products.push(prod);
        }
    }

    return products;
}