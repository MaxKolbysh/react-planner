import {
  MODE_IDLE,
  MODE_3D_FIRST_PERSON,
  MODE_3D_VIEW,
  MODE_SNAPPING,
  SELECT_HOLE,
  SELECT_AREA,
  SELECT_ITEM,
  SELECT_LINE
} from '../constants';
import { rollback, undo, remove, toggleSnap, copyProperties, pasteProperties } from '../actions/project-actions';
import { SNAP_POINT, SNAP_LINE, SNAP_SEGMENT, SNAP_MASK } from '../utils/snap';

const KEY_DELETE = 46;
const KEY_BACKSPACE = 8;
const KEY_ESC = 27;
const KEY_Z = 90;
const KEY_ALT = 18;
const KEY_C = 67;
const KEY_V = 86;

export default function keyboard() {

  return (store, stateExtractor) => {

    window.addEventListener('keydown', event => {

      let state = stateExtractor(store.getState());
      let mode = state.get('mode');

      switch (event.keyCode) {
        case KEY_BACKSPACE:
        case KEY_DELETE:
        {
          if ([MODE_IDLE, MODE_3D_FIRST_PERSON, MODE_3D_VIEW].includes(mode))
            store.dispatch(remove());
          break;
        }
        case KEY_ESC:
        {
          store.dispatch(rollback());
          break;
        }
        case KEY_Z:
        {
          if (event.getModifierState('Control') || event.getModifierState('Meta'))
            store.dispatch(undo());
          break;
        }
        case KEY_ALT:
        {
          if (MODE_SNAPPING.includes(mode))
            store.dispatch(toggleSnap(state.snapMask.merge({ SNAP_POINT: false, SNAP_LINE: false, SNAP_SEGMENT: false, tempSnapConfiguartion: state.snapMask.toJS() })));
          break;
        }
        case KEY_C:
        {
          let selectedLayer = state.getIn(['scene', 'selectedLayer']);
          let selected = state.getIn(['scene', 'layers', selectedLayer, 'selected']);

          if ( ( mode === MODE_IDLE || mode === MODE_3D_VIEW ) && (selected.holes.size || selected.areas.size || selected.items.size || selected.lines.size)) {
            if (selected.holes.size) {
              let hole = state.getIn(['scene', 'layers', selectedLayer, 'holes', selected.holes.get(0)]);
              store.dispatch(copyProperties(hole.get('properties')));
            }
            else if (selected.areas.size) {
              let area = state.getIn(['scene', 'layers', selectedLayer, 'areas', selected.areas.get(0)]);
              store.dispatch(copyProperties(area.properties));
            }
            else if (selected.items.size) {
              let item = state.getIn(['scene', 'layers', selectedLayer, 'items', selected.items.get(0)]);
              store.dispatch(copyProperties(item.properties));
            }
            else if (selected.lines.size) {
              let line = state.getIn(['scene', 'layers', selectedLayer, 'lines', selected.lines.get(0)]);
              store.dispatch(copyProperties(line.properties));
            }
          }
          break;
        }
        case KEY_V:
        {
          store.dispatch(pasteProperties());
          break;
        }
      }

    });

    window.addEventListener('keyup', event => {

      let state = stateExtractor(store.getState());
      let mode = state.get('mode');

      switch (event.keyCode) {
        case KEY_ALT:
        {
          if (MODE_SNAPPING.includes(mode))
            store.dispatch(toggleSnap(state.snapMask.merge(state.snapMask.get('tempSnapConfiguartion'))));
          break;
        }
      }

    });

  }
}
