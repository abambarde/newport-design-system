import { Element, api, track } from 'engine';
import { decisionReducer } from './decision-reducer';
import { createAction } from 'builder_platform_interaction-actions';
import { PROPERTY_EDITOR_ACTION } from 'builder_platform_interaction-constant';
import { nameDescriptionMixin, baseEditor } from 'builder_platform_interaction-base-editor';

import template from './decision-editor.html';

export default class DecisionEditor extends nameDescriptionMixin(baseEditor(Element)) {
    @track activeOutcome;

    // getter and setter for nodes don't work well with mixins
    // currently need to be copied here for each property editor node
    @api
    get node() {
        return this.element;
    }

    @api
    set node(newValue) {
        this.element = newValue || {};
    }

    get outcomes() {
        return (this.element) ? this.element.outcomes : [];
    }

    get initialActiveOutcomeId() {
        return (this.element && this.element.outcomes.length > 0) ? this.element.outcomes[0].guid.value : '';
    }

    get activeOutcomeId() {
        return this.activeOutcome.guid ? this.activeOutcome.guid.value : '';
    }

    connectedCallback() {
        if (this.element.outcomes.length > 0) {
            this.activeOutcome = this.element.outcomes.find(outcome => outcome.guid.value === this.initialActiveOutcomeId);
        }
    }

    /**
     * @param {object} event - property changed event coming from label-description component
     */
    handlePropertyChanged(event) {
        event.stopPropagation();
        const propertyName = event.propertyName;
        const value = event.value;
        const error = event.error;
        const action = createAction(PROPERTY_EDITOR_ACTION.UPDATE_ELEMENT_PROPERTY, { propertyName, value, error});
        this.element = decisionReducer(this.element, action);
    }

    handleOutcomeSelected(event) {
        event.stopPropagation();
        this.activeOutcome = this.element.outcomes.find(outcome => outcome.guid.value === event.detail.itemId);
    }

    // Required because Raptor doesn't know to add this method
    // since we aren't directly extending Element
    render() {
        return template;
    }
}
