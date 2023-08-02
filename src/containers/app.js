import React, { useState } from 'react';
import DeckGL from '@deck.gl/react';
import { PointCloudLayer, TextLayer, LineLayer, COORDINATE_SYSTEM, OrbitView } from 'deck.gl';
import {
  Container, connectToHarmowareVis, HarmoVisLayers, MovesLayer, DepotsLayer, LoadingIcon
} from 'harmoware-vis';
import Controller from '../components/controller';

const INITIAL_VIEW_STATE = {
  target: [0, 0, 0],
  rotationX: 5,
  rotationOrbit: -5,
  zoom: 4
};

const initState = {
  moveOptionVisible: false,
  moveOptionArcVisible: false,
  moveOptionLineVisible: false,
  depotOptionVisible: false,
  optionChange: false,
  iconChange: true,
  iconCubeType: 0,
}

export const colorPallet = [
  [undefined,         "default"],
  [[255,255,255,255], "white"],
  [[255,0,0,255],     "red"],
  [[0,255,0,255],     "green"],
  [[0,0,255,255],     "blue"],
  [[0,255,255,255],   "cyan"],
  [[255,0,255,255],   "magenta"],
  [[255,255,0,255],   "yellow"],
]

const App = (props)=>{
  const [popup,setPopup] = React.useState([0, 0, ''])
  const [state,setState] = React.useState(initState)
  const [viewState, updateViewState] = useState(INITIAL_VIEW_STATE);
  const [pointSiza, setPointSiza] = useState(4);
  const [textSiza, setTextSiza] = useState(5);
  const [orbitViewScale, setOrbitViewScale] = useState(true);
  const [iconColor, setIconColor] = useState(0);
  const [dpIconColor, setDpIconColor] = useState(0);

  const { actions, clickedObject, viewport, loading,
    routePaths, movesbase, movedData, widgetParam } = props;
  const {orbitViewSw=false} = widgetParam
  const depotsData = [...props.depotsData]

  React.useEffect(()=>{
    actions.setDefaultViewport({defaultZoom:13});
    const {property} = widgetParam
    if(property){
      actions.setLeading(property.leading !== undefined ? property.leading:10);
      actions.setTrailing(property.trailing !== undefined ? property.trailing:0);
      if(property.secperhour !== undefined){
        actions.setSecPerHour(property.secperhour);
      }
      if(property.multiplySpeed !== undefined){
        actions.setMultiplySpeed(property.multiplySpeed);
      }
    }
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

  React.useEffect(()=>{
    depotsData.reverse()
  },[dpIconColor])

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

  const getLayer = ()=>{
    const sizeScale = orbitViewSw ? 1:React.useMemo(()=>(Math.max(17 - viewport.zoom,2)**2)*2,[viewport.zoom]);
    const returnLayer = []
    if(movedData.length > 0){
      let {movesLayer:movesLayers} = widgetParam
      if(!movesLayers){
        movesLayers = ["MovesLayer"]
      }
      if(!Array.isArray(movesLayers)){
        movesLayers = [movesLayers]
      }
      const set = new Set(movesLayers);
      movesLayers = [...set];
      for(const movesLayer of movesLayers){
        if((movesLayer === "MovesLayer") && !orbitViewSw){
          const iconlayer = (!state.iconChange ? 'Scatterplot':
            state.iconCubeType === 0 ? 'SimpleMesh':state.iconCubeType === 1 ? 'Scenegraph':'Scatterplot');
          returnLayer.push(new MovesLayer({ routePaths, movesbase, movedData, clickedObject, actions, onHover,
            optionVisible: state.moveOptionVisible, optionArcVisible: state.moveOptionArcVisible,
            optionLineVisible: state.moveOptionLineVisible, optionChange: state.optionChange, iconlayer,
            sizeScale: (iconlayer === 'SimpleMesh' ? sizeScale : (sizeScale/10)),
            iconDesignations:[{layer:iconlayer,getColor:x=>colorPallet[iconColor][0]||x.color||[0,255,0]}]
          }))
        }else
        if(movesLayer === "PointCloudLayer"){
          returnLayer.push(new PointCloudLayer({ id: 'PointCloudLayer', data: movedData,
              coordinateSystem: orbitViewSw ? COORDINATE_SYSTEM.CARTESIAN : COORDINATE_SYSTEM.DEFAULT,
              getPosition: x => x.position, getColor:x=>colorPallet[iconColor][0]||x.color||[0,255,0],
              pointSize: pointSiza, pickable: true, onHover
            })
          )
        }else
        if(movesLayer === "TextLayer"){
          returnLayer.push(new TextLayer({ id: 'TextLayer', data: movedData,
              coordinateSystem: orbitViewSw ? COORDINATE_SYSTEM.CARTESIAN : COORDINATE_SYSTEM.DEFAULT,
              getPosition: x => x.position, getText: x => x.text, getColor: x => x.textColor || [255,255,255,255],
              getSize: textSiza, getTextAnchor: 'start', characterSet: 'auto', pickable: true, onHover
            })
          )
        }
      }      
    }
    if(depotsData.length > 0 && !orbitViewSw){
      const iconlayer = (!state.iconChange ? 'Scatterplot':'SimpleMesh');
      let {depotsLayer:depotsLayers} = widgetParam
      if(!depotsLayers){
        depotsLayers = ["DepotsLayer"]
      }
      if(!Array.isArray(depotsLayers)){
        depotsLayers = [depotsLayers]
      }
      const set = new Set(depotsLayers);
      depotsLayers = [...set];
      for(const depotsLayer of depotsLayers){
        if(depotsLayer === "DepotsLayer"){
          returnLayer.push(new DepotsLayer({ depotsData, onHover,
            optionVisible: state.depotOptionVisible, optionChange: state.optionChange, iconlayer,
            iconDesignations:[{layer:iconlayer, getColor:x=>colorPallet[dpIconColor][0]||x.color||[166,89,166]}]
          }))
        }
      }
    }
    if(orbitViewSw && orbitViewScale){
      returnLayer.push(new LineLayer({
        id:'LineLayer',
        data: [
          {sourcePosition:[50,0,0],targetPosition:[-50,0,0],color:[255,0,0,255]},
          {sourcePosition:[0,50,0],targetPosition:[0,-50,0],color:[255,255,0,255]},
          {sourcePosition:[0,0,50],targetPosition:[0,0,-50],color:[0,255,255,255]},
        ],
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        getWidth: 1,
        widthMinPixels: 1,
        getColor: (x) => x.color || [255,255,255,255],
        opacity: 1,
      }))
    }
    return returnLayer
  }

  const harmoVisLayersProps = {viewport,actions,mapboxApiAccessToken:widgetParam.mapboxApiKey,layers:getLayer()}
  const controllerProps = {...props, status:state,
    pointSiza, setPointSiza, textSiza, setTextSiza, iconColor, setIconColor, dpIconColor, setDpIconColor,
    orbitViewScale, setOrbitViewScale, getMoveOptionChecked, getMoveOptionArcChecked, getMoveOptionLineChecked,
    getDepotOptionChecked, getOptionChangeChecked, getIconChangeChecked, getIconCubeTypeSelected,
  }
  const deckgLProps = {views:new OrbitView({orbitAxis: 'Z', fov: 50}), viewState, controller:{scrollZoom:{smooth:true}},
    onViewStateChange:v => updateViewState(v.viewState), layers:getLayer()
  }
  const baseLayers = ()=>{
    if(!orbitViewSw){
      return(<HarmoVisLayers {...harmoVisLayersProps} />)
    }else{
      return(<DeckGL {...deckgLProps} />)
    }
  }
  const popupsvg = ()=>{
    return(
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
    )
  }

  return (
    <Container {...props}>
      <Controller {...controllerProps} />
      <div className="harmovis_area">
        {baseLayers()}
      </div>
      {popupsvg()}
      <LoadingIcon loading={loading} />
    </Container>
  );
}
export default connectToHarmowareVis(App);
