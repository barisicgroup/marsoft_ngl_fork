import Component from '../component/component';
class CustomComponent extends Component {
    constructor(stage, nanostructure, params = {}) {
        super(stage, nanostructure, params);
        this.stage = stage;
        this.nanostructure = nanostructure;
    }
    get type() {
        return "custom";
    }
    addRepresentation(type, params) {
        return this._addRepresentation(type, this.nanostructure, params);
    }
}
export default CustomComponent;
//# sourceMappingURL=CustomComponent.js.map