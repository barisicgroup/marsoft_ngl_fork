import { BufferDefaultParameters } from "../buffer/buffer";
import RibbonBuffer from "../buffer/ribbon-buffer";
import TubeMeshBuffer from "../buffer/tubemesh-buffer";
import { Debug } from "../globals";
import HermitSpline from "./HermitSpline";
/**
* The purpose of this class is to provide a wrapper to selected NGL buffers
* allowing to create given geometries in a more accessible way.
*/
class BufferCreator {
    static createTubeMeshBuffer(pathElemPositions, pathElemSizes, pathElemColors, interpolationSubdivisions = 1, params = this.defaultTubeMeshBufferParams) {
        return this.createTubeRibbonCommon(pathElemPositions, pathElemSizes, pathElemColors, interpolationSubdivisions, (posArray, normArray, tangArray, binormArray, colArray, sizeArray) => {
            return new TubeMeshBuffer(Object.assign({}, {
                'position': posArray,
                'size': sizeArray,
                'normal': normArray,
                'binormal': binormArray,
                'tangent': tangArray,
                'color': colArray
            }), params);
        });
    }
    static createTubeMeshBufferUniformParams(pathElemPositions, elemsSize, elemsColor, interpolationSubdivisions = 1, params = this.defaultTubeMeshBufferParams) {
        let pathElemSizes = new Array(pathElemPositions.length);
        let pathElemColors = new Array(pathElemPositions.length);
        pathElemSizes.fill(elemsSize);
        pathElemColors.fill(elemsColor);
        return this.createTubeMeshBuffer(pathElemPositions, pathElemSizes, pathElemColors, interpolationSubdivisions, params);
    }
    static createRibbonBuffer(pathElemPositions, pathElemSizes, pathElemColors, interpolationSubdivisions = 1, params = this.defaultRibbonBufferParams) {
        return this.createTubeRibbonCommon(pathElemPositions, pathElemSizes, pathElemColors, interpolationSubdivisions, (posArray, normArray, tangArray, binormArray, colArray, sizeArray) => {
            return new RibbonBuffer(Object.assign({}, {
                'position': posArray,
                'size': sizeArray,
                'normal': binormArray,
                'dir': normArray,
                'color': colArray
            }), params);
        });
    }
    static createRibbonBufferUniformParams(pathElemPositions, elemsSize, elemsColor, interpolationSubdivisions = 1, params = this.defaultRibbonBufferParams) {
        let pathElemSizes = new Array(pathElemPositions.length);
        let pathElemColors = new Array(pathElemPositions.length);
        pathElemSizes.fill(elemsSize);
        pathElemColors.fill(elemsColor);
        return this.createRibbonBuffer(pathElemPositions, pathElemSizes, pathElemColors, interpolationSubdivisions, params);
    }
    static createTubeRibbonCommon(pathElemPositions, pathElemSizes, pathElemColors, interpolationSubdivisions = 1, returnCallback) {
        if (Debug && (pathElemPositions.length != pathElemSizes.length || pathElemPositions.length != pathElemColors.length)) {
            console.error("Invalid input arguments! Following arrays must have the same length: ", pathElemPositions, pathElemSizes, pathElemColors);
        }
        const interpolationSpline = new HermitSpline(pathElemPositions, interpolationSubdivisions);
        const interpolPoints = interpolationSpline.points;
        const interpolNormals = interpolationSpline.normals;
        const interpolTangents = interpolationSpline.tangents;
        const interpolBinormals = [];
        const interpolColors = [];
        const interpolSizes = [];
        for (let i = 0; i < interpolNormals.length; ++i) {
            interpolBinormals.push(interpolNormals[i].clone().cross(interpolTangents[i]));
        }
        for (let i = 0; i < pathElemPositions.length - 1; ++i) {
            for (let j = 0; j < interpolationSubdivisions + 2; ++j) {
                const t = j / (interpolationSubdivisions + 1);
                interpolColors.push(pathElemColors[i].clone().lerp(pathElemColors[i + 1], t));
                interpolSizes.push(pathElemSizes[i] * t + pathElemSizes[i + 1] * (1 - t));
            }
        }
        const posArray = new Float32Array(interpolPoints.length * 3);
        const normArray = new Float32Array(interpolPoints.length * 3);
        const tangArray = new Float32Array(interpolPoints.length * 3);
        const binormArray = new Float32Array(interpolPoints.length * 3);
        const colArray = new Float32Array(interpolPoints.length * 3);
        const sizeArray = new Float32Array(interpolSizes);
        for (let i = 0; i < interpolPoints.length; ++i) {
            posArray[3 * i] = interpolPoints[i].x;
            posArray[3 * i + 1] = interpolPoints[i].y;
            posArray[3 * i + 2] = interpolPoints[i].z;
            normArray[3 * i] = interpolNormals[i].x;
            normArray[3 * i + 1] = interpolNormals[i].y;
            normArray[3 * i + 2] = interpolNormals[i].z;
            tangArray[3 * i] = interpolTangents[i].x;
            tangArray[3 * i + 1] = interpolTangents[i].y;
            tangArray[3 * i + 2] = interpolTangents[i].z;
            binormArray[3 * i] = interpolBinormals[i].x;
            binormArray[3 * i + 1] = interpolBinormals[i].y;
            binormArray[3 * i + 2] = interpolBinormals[i].z;
            colArray[3 * i] = interpolColors[i].x;
            colArray[3 * i + 1] = interpolColors[i].y;
            colArray[3 * i + 2] = interpolColors[i].z;
        }
        return returnCallback(posArray, normArray, tangArray, binormArray, colArray, sizeArray);
    }
}
BufferCreator.defaultTubeMeshBufferParams = Object.assign({
    radialSegments: 8,
    capped: true,
    aspectRatio: 1.0
}, BufferDefaultParameters);
BufferCreator.defaultRibbonBufferParams = BufferDefaultParameters;
export default BufferCreator;
//# sourceMappingURL=BufferCreator.js.map