import { Vector3 } from "three";
import Buffer, { BufferParameters, BufferDefaultParameters } from "../buffer/buffer";
import RibbonBuffer from "../buffer/ribbon-buffer";
import TubeMeshBuffer, { TubeMeshBufferParameters } from "../buffer/tubemesh-buffer";
import { Debug } from "../globals";
import HermitSpline from "./HermitSpline";

/**
* The purpose of this class is to provide a wrapper to selected NGL buffers
* allowing to create given geometries in a more accessible way.
*/
class BufferCreator {
    public static readonly defaultTubeMeshBufferParams: Partial<TubeMeshBufferParameters> = Object.assign({
        radialSegments: 8,
        capped: true,
        aspectRatio: 1.0
    }, BufferDefaultParameters);

    public static readonly defaultRibbonBufferParams: Partial<BufferParameters> = BufferDefaultParameters;

    public static createTubeMeshBuffer(pathElemPositions: Vector3[], pathElemSizes: number[], pathElemColors: Vector3[],
        interpolationSubdivisions: number = 1,
        params: Partial<TubeMeshBufferParameters> = this.defaultTubeMeshBufferParams): Buffer {

        return this.createTubeRibbonCommon(pathElemPositions, pathElemSizes, pathElemColors, interpolationSubdivisions,
            (posArray: Float32Array, normArray: Float32Array, tangArray: Float32Array,
                binormArray: Float32Array, colArray: Float32Array, sizeArray: Float32Array) => {
                return new TubeMeshBuffer(
                    Object.assign({}, {
                        'position': posArray,
                        'size': sizeArray,
                        'normal': normArray,
                        'binormal': binormArray,
                        'tangent': tangArray,
                        'color': colArray
                    }),
                    params);
            });
    }

    public static createTubeMeshBufferUniformParams(pathElemPositions: Vector3[], elemsSize: number, elemsColor: Vector3,
        interpolationSubdivisions: number = 1,
        params: Partial<TubeMeshBufferParameters> = this.defaultTubeMeshBufferParams): Buffer {
        let pathElemSizes = new Array(pathElemPositions.length);
        let pathElemColors = new Array(pathElemPositions.length);

        pathElemSizes.fill(elemsSize);
        pathElemColors.fill(elemsColor);

        return this.createTubeMeshBuffer(pathElemPositions, pathElemSizes, pathElemColors,
            interpolationSubdivisions, params);
    }

    public static createRibbonBuffer(pathElemPositions: Vector3[], pathElemSizes: number[], pathElemColors: Vector3[],
        interpolationSubdivisions: number = 1,
        params: Partial<BufferParameters> = this.defaultRibbonBufferParams): Buffer {

        return this.createTubeRibbonCommon(pathElemPositions, pathElemSizes, pathElemColors, interpolationSubdivisions,
            (posArray: Float32Array, normArray: Float32Array, tangArray: Float32Array,
                binormArray: Float32Array, colArray: Float32Array, sizeArray: Float32Array) => {
                return new RibbonBuffer(
                    Object.assign({}, {
                        'position': posArray,
                        'size': sizeArray,
                        'normal': binormArray,
                        'dir': normArray,
                        'color': colArray
                    }),
                    params);
            });
    }

    public static createRibbonBufferUniformParams(pathElemPositions: Vector3[], elemsSize: number, elemsColor: Vector3,
        interpolationSubdivisions: number = 1,
        params: Partial<TubeMeshBufferParameters> = this.defaultRibbonBufferParams) {
        let pathElemSizes = new Array(pathElemPositions.length);
        let pathElemColors = new Array(pathElemPositions.length);

        pathElemSizes.fill(elemsSize);
        pathElemColors.fill(elemsColor);

        return this.createRibbonBuffer(pathElemPositions, pathElemSizes, pathElemColors,
            interpolationSubdivisions, params);
    }

    private static createTubeRibbonCommon(pathElemPositions: Vector3[], pathElemSizes: number[], pathElemColors: Vector3[],
        interpolationSubdivisions: number = 1,
        returnCallback: (posArray: Float32Array, normArray: Float32Array, tangArray: Float32Array,
            binormArray: Float32Array, colArray: Float32Array, sizeArray: Float32Array) => Buffer): Buffer {
        if (Debug && (pathElemPositions.length != pathElemSizes.length || pathElemPositions.length != pathElemColors.length)) {
            console.error("Invalid input arguments! Following arrays must have the same length: ",
                pathElemPositions, pathElemSizes, pathElemColors);
        }

        const interpolationSpline = new HermitSpline(pathElemPositions, interpolationSubdivisions);

        const interpolPoints: Vector3[] = interpolationSpline.points;
        const interpolNormals: Vector3[] = interpolationSpline.normals;
        const interpolTangents: Vector3[] = interpolationSpline.tangents;
        const interpolBinormals: Vector3[] = [];
        const interpolColors: Vector3[] = [];
        const interpolSizes: number[] = [];

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

export default BufferCreator;