import {Color, Vector3} from "three";
import Buffer, { BufferParameters, BufferDefaultParameters } from "../../buffer/buffer";
import { CylinderBufferParameters, CylinderBufferDefaultParameters } from "../../buffer/cylinder-buffer";
import CylinderGeometryBuffer from '../../buffer/cylindergeometry-buffer';
import CylinderImpostorBuffer from '../../buffer/cylinderimpostor-buffer';
import RibbonBuffer from "../../buffer/ribbon-buffer";
import TubeMeshBuffer, { TubeMeshBufferParameters } from "../../buffer/tubemesh-buffer";
import WidelineBuffer, { WideLineBufferDefaultParameters, WideLineBufferParameters } from "../../buffer/wideline-buffer";
import { Debug } from "../../globals";
import HermitSpline from "./HermitSpline";
import { Picker } from "../../utils/picker";

/**
* The purpose of this class is to provide a wrapper to selected NGL buffers
* allowing to create given geometries in a more accessible way.
*/
class BufferCreator {
    public static insertVector3InFloat32Array(array: Float32Array, vector: Vector3, position: number) {
        array[position] = vector.x;
        array[position+1] = vector.y;
        array[position+2] = vector.z;
    }

    public static insertColorInFloat32Array(array: Float32Array, color: Color, position: number) {
        array[position] = color.r;
        array[position+1] = color.g;
        array[position+2] = color.b;
    }

    public static readonly defaultTubeMeshBufferParams: Partial<TubeMeshBufferParameters> = Object.assign(
        BufferDefaultParameters, {
        radialSegments: 8,
        capped: true,
        aspectRatio: 1.0
    });

    public static readonly defaultRibbonBufferParams: Partial<BufferParameters> = BufferDefaultParameters;

    public static readonly defaultWidelineBufferParams: Partial<WideLineBufferParameters> = WideLineBufferDefaultParameters;

    public static readonly defaultCylinderBufferParams: Partial<CylinderBufferParameters> = Object.assign(
        CylinderBufferDefaultParameters, {
        radialSegments: 8
    });

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

    public static createWideLineBuffer(startPos: Vector3, endPos: Vector3, startColor: Vector3,
        endColor: Vector3, lineWidth: number, params: Partial<WideLineBufferParameters> = this.defaultWidelineBufferParams): Buffer {
        return new WidelineBuffer(Object.assign({}, {
            'position1': Float32Array.of(startPos.x, startPos.y, startPos.z),
            'position2': Float32Array.of(endPos.x, endPos.y, endPos.z),
            'color': Float32Array.of(startColor.x, startColor.y, startColor.z),
            'color2': Float32Array.of(endColor.x, endColor.y, endColor.z),
        }), Object.assign(params, {
            'linewidth': lineWidth
        }));
    }

    public static createWideLinePairsBuffer(vertices: Vector3[], colors: Vector3[], lineWidth: number,
        params: Partial<WideLineBufferParameters> = this.defaultWidelineBufferParams): Buffer {
        const arrElems = (vertices.length / 2) * 3;

        const position1 = new Float32Array(arrElems);
        const position2 = new Float32Array(arrElems);
        const color = new Float32Array(arrElems);
        const color2 = new Float32Array(arrElems);

        for (let i = 0; i < vertices.length - 1; i += 2) {
            const buffArrayStartPos = 3 * (i / 2);

            position1[buffArrayStartPos] = vertices[i].x;
            position1[buffArrayStartPos + 1] = vertices[i].y;
            position1[buffArrayStartPos + 2] = vertices[i].z;

            color[buffArrayStartPos] = colors[i].x;
            color[buffArrayStartPos + 1] = colors[i].y;
            color[buffArrayStartPos + 2] = colors[i].z;

            position2[buffArrayStartPos] = vertices[i + 1].x;
            position2[buffArrayStartPos + 1] = vertices[i + 1].y;
            position2[buffArrayStartPos + 2] = vertices[i + 1].z;

            color2[buffArrayStartPos] = colors[i + 1].x;
            color2[buffArrayStartPos + 1] = colors[i + 1].y;
            color2[buffArrayStartPos + 2] = colors[i + 1].z;
        }

        return new WidelineBuffer(Object.assign({}, {
            'position1': position1,
            'position2': position2,
            'color': color,
            'color2': color2,
        }), Object.assign(params, {
            'linewidth': lineWidth
        }));
    }

    public static createWideLineStripBuffer(vertices: Vector3[], colors: Vector3[], lineWidth: number,
        pickingIds?: number[], pickingCreator?: (idsArr: number[]) => Picker,
        params: Partial<WideLineBufferParameters> = this.defaultWidelineBufferParams): Buffer {
        const arrElems = (vertices.length - 1) * 3;

        const position1 = new Float32Array(arrElems);
        const position2 = new Float32Array(arrElems);
        const color = new Float32Array(arrElems);
        const color2 = new Float32Array(arrElems);

        for (let i = 0; i < vertices.length - 1; ++i) {
            const buffArrayStartPos = 3 * i;

            position1[buffArrayStartPos] = vertices[i].x;
            position1[buffArrayStartPos + 1] = vertices[i].y;
            position1[buffArrayStartPos + 2] = vertices[i].z;

            color[buffArrayStartPos] = colors[i].x;
            color[buffArrayStartPos + 1] = colors[i].y;
            color[buffArrayStartPos + 2] = colors[i].z;

            position2[buffArrayStartPos] = vertices[i + 1].x;
            position2[buffArrayStartPos + 1] = vertices[i + 1].y;
            position2[buffArrayStartPos + 2] = vertices[i + 1].z;

            color2[buffArrayStartPos] = colors[i + 1].x;
            color2[buffArrayStartPos + 1] = colors[i + 1].y;
            color2[buffArrayStartPos + 2] = colors[i + 1].z;
        }

        return new WidelineBuffer(Object.assign({}, {
            'position1': position1,
            'position2': position2,
            'color': color,
            'color2': color2,
            'picking': pickingCreator !== undefined && pickingIds !== undefined ? pickingCreator(pickingIds) : undefined,
        }), Object.assign(params, {
            'linewidth': lineWidth
        }));
    }

    public static createCylinderBuffer(startPos: Vector3, endPos: Vector3, startColor: Vector3,
        endColor: Vector3, radius: number, openEnded: boolean = false, disableImpostor: boolean = false,
        params: Partial<CylinderBufferParameters> = this.defaultCylinderBufferParams): Buffer {
        const SelectedBufferClass = disableImpostor ? CylinderGeometryBuffer : CylinderImpostorBuffer;

        return new SelectedBufferClass(Object.assign({}, {
            'position1': Float32Array.of(startPos.x, startPos.y, startPos.z),
            'position2': Float32Array.of(endPos.x, endPos.y, endPos.z),
            'color': Float32Array.of(startColor.x, startColor.y, startColor.z),
            'color2': Float32Array.of(endColor.x, endColor.y, endColor.z),
            'radius': Float32Array.of(radius)
        }), Object.assign(params, {
            openEnded: openEnded,
            disableImpostor: disableImpostor
        }));
    }

    // |vertices| === |colors| === |radiuses*2|
    public static createCylinderPairsBuffer(vertices: Vector3[], colors: Vector3[], radiuses: number[],
        openEnded: boolean = false, disableImpostor: boolean = false,
        params: Partial<CylinderBufferParameters> = this.defaultCylinderBufferParams): Buffer {
        const SelectedBufferClass = disableImpostor ? CylinderGeometryBuffer : CylinderImpostorBuffer;

        const arrElems = (vertices.length / 2) * 3;

        const position1 = new Float32Array(arrElems);
        const position2 = new Float32Array(arrElems);
        const color = new Float32Array(arrElems);
        const color2 = new Float32Array(arrElems);
        const radius = new Float32Array(radiuses); // Radius is per cylinder, not element

        for (let i = 0; i < vertices.length - 1; i += 2) {
            const buffArrayStartPos = 3 * (i / 2);

            position1[buffArrayStartPos] = vertices[i].x;
            position1[buffArrayStartPos + 1] = vertices[i].y;
            position1[buffArrayStartPos + 2] = vertices[i].z;

            color[buffArrayStartPos] = colors[i].x;
            color[buffArrayStartPos + 1] = colors[i].y;
            color[buffArrayStartPos + 2] = colors[i].z;

            position2[buffArrayStartPos] = vertices[i + 1].x;
            position2[buffArrayStartPos + 1] = vertices[i + 1].y;
            position2[buffArrayStartPos + 2] = vertices[i + 1].z;

            color2[buffArrayStartPos] = colors[i + 1].x;
            color2[buffArrayStartPos + 1] = colors[i + 1].y;
            color2[buffArrayStartPos + 2] = colors[i + 1].z;
        }

        return new SelectedBufferClass(Object.assign({}, {
            'position1': position1,
            'position2': position2,
            'color': color,
            'color2': color2,
            'radius': radius,
        }), Object.assign(params, {
            openEnded: openEnded,
            disableImpostor: disableImpostor
        }));
    }

    // |vertices| === |colors| === |radiuses+1|
    public static createCylinderStripBuffer(vertices: Vector3[], colors: Vector3[], radiuses: number[],
        pickingIds?: number[], pickingCreator?: (idsArr: number[]) => Picker,
        openEnded: boolean = false, disableImpostor: boolean = false,
        params: Partial<CylinderBufferParameters> = this.defaultCylinderBufferParams): Buffer {

        const arrElems = (vertices.length - 1) * 3;

        const position1 = new Float32Array(arrElems);
        const position2 = new Float32Array(arrElems);
        const color = new Float32Array(arrElems);
        const color2 = new Float32Array(arrElems);
        const radius = new Float32Array(radiuses); // Radius is per cylinder, not element

        for (let i = 0; i < vertices.length - 1; ++i) {
            const buffArrayStartPos = 3 * i;

            position1[buffArrayStartPos] = vertices[i].x;
            position1[buffArrayStartPos + 1] = vertices[i].y;
            position1[buffArrayStartPos + 2] = vertices[i].z;

            color[buffArrayStartPos] = colors[i].x;
            color[buffArrayStartPos + 1] = colors[i].y;
            color[buffArrayStartPos + 2] = colors[i].z;

            position2[buffArrayStartPos] = vertices[i + 1].x;
            position2[buffArrayStartPos + 1] = vertices[i + 1].y;
            position2[buffArrayStartPos + 2] = vertices[i + 1].z;

            color2[buffArrayStartPos] = colors[i + 1].x;
            color2[buffArrayStartPos + 1] = colors[i + 1].y;
            color2[buffArrayStartPos + 2] = colors[i + 1].z;
        }

        const picking = pickingCreator !== undefined && pickingIds !== undefined ? pickingCreator(pickingIds) : undefined;

        return this.createCylinderStripBufferFromArrays(position1, position2, color, color2, radius,
            picking, openEnded, disableImpostor, params);
    }

    public static createCylinderStripBufferFromArrays(position1: Float32Array, position2: Float32Array,
                                                       color: Float32Array, color2: Float32Array, radius: Float32Array,
                                                       picking: Picker | undefined,
                                                       openEnded: boolean = false, disableImpostor: boolean = false,
                                                       params: Partial<CylinderBufferParameters> = this.defaultCylinderBufferParams): Buffer {
        const SelectedBufferClass = disableImpostor ? CylinderGeometryBuffer : CylinderImpostorBuffer;
        return new SelectedBufferClass(Object.assign({}, {
            'position1': position1,
            'position2': position2,
            'color': color,
            'color2': color2,
            'radius': radius,
            'picking': picking
        }), Object.assign(params, {
            openEnded: openEnded,
            disableImpostor: disableImpostor
        }));
    }

    public static createSphereBufferFromArrays(position1: Float32Array, position2: Float32Array,
                                               color: Float32Array, color2: Float32Array, radius: Float32Array,
                                               picking: Picker | undefined,
                                               openEnded: boolean = false, disableImpostor: boolean = false,
                                               params: Partial<CylinderBufferParameters> = this.defaultCylinderBufferParams): Buffer {
        const SelectedBufferClass = disableImpostor ? CylinderGeometryBuffer : CylinderImpostorBuffer;
        return new SelectedBufferClass(Object.assign({}, {
            'position1': position1,
            'position2': position2,
            'color': color,
            'color2': color2,
            'radius': radius,
            'picking': picking
        }), Object.assign(params, {
            openEnded: openEnded,
            disableImpostor: disableImpostor
        }));
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