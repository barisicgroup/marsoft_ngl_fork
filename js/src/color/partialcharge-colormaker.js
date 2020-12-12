/**
 * @file Partialcharge Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { ColormakerRegistry } from '../globals';
import Colormaker from './colormaker';
/**
 * Color by partial charge. The {@link AtomProxy.partialCharge} property is used for coloring.
 * The default domain is [-1, 1].
 *
 * __Name:__ _partialCharge_
 *
 * @example
 * stage.loadFile("rcsb://1crn").then(function (o) {
 *   o.addRepresentation("ball+stick", {colorScheme: "partialCharge"});
 *   o.autoView();
 * });
 */
class PartialchargeColormaker extends Colormaker {
    constructor(params) {
        super(params);
        if (!params.scale) {
            this.parameters.scale = 'rwb';
        }
        if (!params.domain) {
            this.parameters.domain = [-1, 1];
        }
        this.partialchargeScale = this.getScale();
    }
    atomColor(a) {
        return this.partialchargeScale(a.partialCharge || 0);
    }
}
ColormakerRegistry.add('partialcharge', PartialchargeColormaker);
export default PartialchargeColormaker;
//# sourceMappingURL=partialcharge-colormaker.js.map