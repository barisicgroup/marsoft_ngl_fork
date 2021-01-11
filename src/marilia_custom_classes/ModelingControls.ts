import { Vector3 } from "three";
import PickingProxy from "../controls/picking-proxy";
import { Stage, ShapeComponent } from "../ngl";
import DnaOrigamiNanostructure from "./DnaOrigamiNanostructure"
import CustomComponent from "./CustomComponent"
import Shape from "../geometry/shape";

class ModelingControls {
    private _isEnabled: boolean;
    private newComponentPositions: Vector3[];
    private pointVisTempShapeComponent: ShapeComponent;
    private lastNumOfPoints: number = 0;

    public stage: Stage;

    constructor(stage: Stage) {
        this.stage = stage;
        this._isEnabled = false;
        this.newComponentPositions = [];

        // .bind(this) call is necessary to have correct "this" reference in the event listeners
        this.stage.signals.clicked.add(this.onMouseClick.bind(this));

        this.update = this.update.bind(this);
        this.resetControls = this.resetControls.bind(this);

        this.update();
    }

    get isEnabled(): boolean {
        return this._isEnabled;
    }

    set isEnabled(value: boolean) {
        this._isEnabled = value;
        if (!value) {
            this.resetControls();
        }
    }

    update(): void {
        if (this.newComponentPositions.length !== this.lastNumOfPoints) {
            if (this.pointVisTempShapeComponent !== undefined) {
                this.stage.removeComponent(this.pointVisTempShapeComponent);
            }

            if (this.newComponentPositions.length > 0) {
                const shape = new Shape("[temp-sel-vis]");

                for (let i = 0; i < this.newComponentPositions.length; ++i) {
                    shape.addPoint(this.newComponentPositions[i], [0, 1, 0], "Selection point");
                }

                for (let i = 0; i < this.newComponentPositions.length - 1; ++i) {
                    shape.addWideline(this.newComponentPositions[i],
                        this.newComponentPositions[i + 1],
                        [0, 0, 1], 2, "");
                }

                this.pointVisTempShapeComponent = new ShapeComponent(this.stage, shape);
                this.pointVisTempShapeComponent.addRepresentation("buffer");

                this.stage.addComponent(this.pointVisTempShapeComponent);
            }

            this.lastNumOfPoints = this.newComponentPositions.length;
        }

        window.requestAnimationFrame(this.update);
    }

    resetControls(): void {
        this.newComponentPositions = [];
    }

    onMouseClick(pickingProxy: PickingProxy): void {
        if (!this.isEnabled || pickingProxy !== undefined) { return; }

        if (this.newComponentPositions.length < 3) {
            this.newComponentPositions.push(
                this.stage.mouseObserver.getWorldPosition());
        }

        if (this.newComponentPositions.length === 3) {
            const bottomLeftCornerPos: Vector3 = this.newComponentPositions[0];
            const blcToBrcVec: Vector3 = this.newComponentPositions[1].clone().sub(this.newComponentPositions[0]);
            const brcToTrcVec: Vector3 = this.newComponentPositions[2].clone().sub(this.newComponentPositions[1]);

            let newStructure = new DnaOrigamiNanostructure("DNA Origami Nanostructure", bottomLeftCornerPos, blcToBrcVec, brcToTrcVec);
            let newComp = new CustomComponent(this.stage, newStructure);

            newComp.setName("From Scratch");
            this.stage.addComponent(newComp);

            newComp.addRepresentation("multiscale", undefined);

            setTimeout(this.resetControls, 500);
        }
    }
}

export default ModelingControls;