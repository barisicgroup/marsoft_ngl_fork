import Component from '../component/component';
class CustomComponent extends Component {
    constructor(stage, object, params = {}) {
        super(stage, object, params);
        this.stage = stage;
        this.object = object;
    }
    get type() {
        return "custom";
    }
    addRepresentation(type, object) {
        const reprComp = this._addRepresentation(type, object, null);
        return reprComp;
    }
}
export default CustomComponent;
//# sourceMappingURL=CustomComponent.js.map