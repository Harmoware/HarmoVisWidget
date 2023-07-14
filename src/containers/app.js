import React from 'react';
import {
  Container, connectToHarmowareVis, HarmoVisLayers, MovesLayer, DepotsLayer, LoadingIcon
} from 'harmoware-vis';
import Controller from '../components/controller';

const initState = {
  moveOptionVisible: false,
  moveOptionArcVisible: false,
  moveOptionLineVisible: false,
  depotOptionVisible: false,
  optionChange: false,
  iconChange: true,
  iconCubeType: 0,
}

const App = (props)=>{
  const [popup,setPopup] = React.useState([0, 0, ''])
  const [state,setState] = React.useState(initState)

  const { actions, clickedObject, viewport, loading,
    routePaths, movesbase, movedData, depotsData, widgetParam } = props;
  const optionVisible = false;

  React.useEffect(()=>{
    actions.setDefaultViewport({defaultZoom:13});
    actions.setLeading(widgetParam.leading ? widgetParam.leading:10);
    actions.setTrailing(widgetParam.trailing ? widgetParam.trailing:0);
  },[])

  React.useEffect(()=>{
    if(widgetParam.viewport){
      actions.setViewport(widgetParam.viewport);
      actions.setInitialViewChange(false);
    }else{
      actions.setInitialViewChange(true);
    }
  },[widgetParam.viewport])

  React.useEffect(()=>{
    actions.setLoading(true);
    actions.setInputFilename({ movesFileName: "" });
    if(widgetParam.movesbase){
      actions.setMovesBase(widgetParam.movesbase);
    }else{
      actions.setMovesBase([]);
    }
    actions.setRoutePaths([]);
    actions.setClicked(null);
    actions.setAnimatePause(false);
    actions.setAnimateReverse(false);
    actions.setLoading(false);
  },[widgetParam.movesbase])

  React.useEffect(()=>{
    actions.setInputFilename({ depotsFileName: "" });
    if(widgetParam.depotsBase){
      actions.setDepotsBase(widgetParam.depotsBase);
    }else{
      actions.setDepotsBase([]);
    }
  },[widgetParam.depotsBase])

  const arrStrConv = (value)=>Array.isArray(value)?`[${value.map(el=>arrStrConv(el))}]`:value.toString()
  const onHover = (el)=>{
    if (el && el.object) {
      let disptext = '';
      const objctlist = Object.entries(el.object);
      for (let i = 0, lengthi = objctlist.length; i < lengthi; i=(i+1)|0) {
        const strvalue = arrStrConv(objctlist[i][1]);
        disptext = disptext + (i > 0 ? '\n' : '');
        disptext = disptext + (`${objctlist[i][0]}: ${strvalue}`);
      }
      setPopup([el.x, el.y, disptext]);
    } else {
      setPopup([0, 0, '']);
    }
  }

  const getMoveOptionChecked = (e)=>{
    setState({ ...state, moveOptionVisible: e.target.checked });
  }

  const getMoveOptionArcChecked = (e)=>{
    setState({ ...state, moveOptionArcVisible: e.target.checked });
  }

  const getMoveOptionLineChecked = (e)=>{
    setState({ ...state, moveOptionLineVisible: e.target.checked });
  }

  const getDepotOptionChecked = (e)=>{
    setState({ ...state, depotOptionVisible: e.target.checked });
  }

  const getOptionChangeChecked = (e)=>{
    setState({ ...state, optionChange: e.target.checked });
  }

  const getIconChangeChecked = (e)=>{
    setState({ ...state, iconChange: e.target.checked });
  }

  const getIconCubeTypeSelected = (e)=>{
    setState({ ...state, iconCubeType: +e.target.value });
  }

  const sizeScale = React.useMemo(()=>(Math.max(17 - viewport.zoom,2)**2)*2,[viewport.zoom]);

  const movesLayerProps = { routePaths, movesbase, movedData, clickedObject, actions, optionVisible, onHover,
    optionVisible: state.moveOptionVisible, optionArcVisible: state.moveOptionArcVisible,
    optionLineVisible: state.moveOptionLineVisible, optionChange: state.optionChange, iconChange: state.iconChange,
    iconCubeType: state.iconCubeType, sizeScale: (state.iconCubeType === 0 ? sizeScale : (sizeScale/10)), }

  const depotsLayerProps = { depotsData, optionVisible, onHover,
    optionVisible: state.depotOptionVisible, optionChange: state.optionChange, iconChange: state.iconChange, }

  return (
    <Container {...props}>
      <Controller
        {...props} status={state}
        iconCubeType={state.iconCubeType}
        getMoveOptionChecked={getMoveOptionChecked}
        getMoveOptionArcChecked={getMoveOptionArcChecked}
        getMoveOptionLineChecked={getMoveOptionLineChecked}
        getDepotOptionChecked={getDepotOptionChecked}
        getOptionChangeChecked={getOptionChangeChecked}
        getIconChangeChecked={getIconChangeChecked}
        getIconCubeTypeSelected={getIconCubeTypeSelected}
      />
      <div className="harmovis_area">
        <HarmoVisLayers
          viewport={viewport} actions={actions}
          mapboxApiAccessToken={widgetParam.mapboxApiKey}
          layers={[
            new MovesLayer({ ...movesLayerProps }),
            new DepotsLayer({ ...depotsLayerProps }),
          ]}
        />
      </div>
      <svg width={viewport.width} height={viewport.height} className="harmovis_overlay">
        <g fill="white" fontSize="12">
          {popup[2].length > 0 ?
            popup[2].split('\n').map((value, index) =>
              <text
                x={popup[0] + 10} y={popup[1] + (index * 12)}
                key={index.toString()}
              >{value}</text>) : null
          }
        </g>
      </svg>
      <LoadingIcon loading={loading} />
    </Container>
  );
}
export default connectToHarmowareVis(App);
