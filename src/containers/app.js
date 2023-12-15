import React, { useState } from 'react';
import DeckGL from '@deck.gl/react';
import {
  PointCloudLayer, TextLayer, PolygonLayer, HeatmapLayer, LineLayer, ScatterplotLayer, GridCellLayer, COORDINATE_SYSTEM, OrbitView
} from 'deck.gl';
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
  const [heatmapArea,setHeatmapArea] = useState(1);
  const [heatmapColor,setHeatmapColor] = useState([[255,237,209],[248,203,98],[246,163,52],[232,93,38],[207,62,55]]);
  const [heatmapMaxValue,setHeatmapMaxValue] = useState(0)
  const [elevationStr,setElevationStr] = useState("elevation")
  const [textStr,setTextStr] = useState("text")
  const [textColorStr,setTextColor] = useState("textColor")
  const [colorStr,setColorStr] = useState("color")
  const [distance_rate,setDistance_rate] = useState([0.0110910, 0.0090123])  //初期値は北緯37度での係数（度/km）
  const [cellSize,setCellSize] = useState(1000)

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
    let findIdx = widgetParam.movesLayer.findIndex((x)=>x === "Heatmap3dLayer")
    if(findIdx >= 0){
      const assignProps = widgetParam.movesLayer[findIdx+1]
      const {heatmapArea,heatmapColor,heatmapMaxValue,elevationStr} = JSON.parse(assignProps)
      if(heatmapArea !== undefined && !isNaN(heatmapArea)){
        setHeatmapArea(heatmapArea)
      }
      if(heatmapColor !== undefined && Array.isArray(heatmapColor)){
        setHeatmapColor(heatmapColor)
      }
      if(heatmapMaxValue !== undefined && !isNaN(heatmapMaxValue)){
        setHeatmapMaxValue(heatmapMaxValue)
      }else{
        setHeatmapMaxValue(0)
      }
      if(elevationStr !== undefined && isNaN(elevationStr)){
        setElevationStr(elevationStr)
      }
    }
    findIdx = widgetParam.movesLayer.findIndex((x)=>x === "Heatmap2dLayer")
    if(findIdx >= 0){
      const assignProps = widgetParam.movesLayer[findIdx+1]
      const {heatmapColor,elevationStr} = JSON.parse(assignProps)
      if(heatmapColor !== undefined && Array.isArray(heatmapColor)){
        setHeatmapColor(heatmapColor)
      }
      if(elevationStr !== undefined && isNaN(elevationStr)){
        setElevationStr(elevationStr)
      }
    }
    findIdx = widgetParam.movesLayer.findIndex((x)=>x === "TextLayer")
    if(findIdx >= 0){
      const assignProps = widgetParam.movesLayer[findIdx+1]
      const {textStr,textColorStr} = JSON.parse(assignProps)
      if(textStr !== undefined && isNaN(textStr)){
        setTextStr(textStr)
      }
      if(textColorStr !== undefined && isNaN(textColorStr)){
        setTextColor(textColorStr)
      }
    }
    findIdx = widgetParam.movesLayer.findIndex((x)=>x === "MovesLayer" || x === "PointCloudLayer" || x === "ScatterplotLayer")
    if(findIdx >= 0){
      const assignProps = widgetParam.movesLayer[findIdx+1]
      const {colorStr} = JSON.parse(assignProps)
      if(colorStr !== undefined && isNaN(colorStr)){
        setColorStr(colorStr)
      }
    }
    findIdx = widgetParam.movesLayer.findIndex((x)=>x === "GridCellLayer")
    if(findIdx >= 0){
      const assignProps = widgetParam.movesLayer[findIdx+1]
      const {cellSize,elevationStr,colorStr} = JSON.parse(assignProps)
      if(cellSize !== undefined && !isNaN(cellSize)){
        setCellSize(cellSize)
      }
      if(elevationStr !== undefined && isNaN(elevationStr)){
        setElevationStr(elevationStr)
      }
      if(colorStr !== undefined && isNaN(colorStr)){
        setColorStr(colorStr)
      }
    }
  },[widgetParam.movesLayer])

  React.useEffect(()=>{
    depotsData.reverse()
  },[dpIconColor])

  React.useEffect(()=>{
    const R = Math.PI / 180;
    const long1 = viewport.longitude*R
    const long2 = (viewport.longitude+1)*R
    const lati1 = viewport.latitude*R
    const lati2 = (viewport.latitude+1)*R
    setDistance_rate([
      1/(6371 * Math.acos(Math.cos(lati1) * Math.cos(lati1) * Math.cos(long2 - long1) + Math.sin(lati1) * Math.sin(lati1))),
      1/(6371 * Math.acos(Math.cos(lati1) * Math.cos(lati2) * Math.cos(long1 - long1) + Math.sin(lati1) * Math.sin(lati2)))
    ])
  },[movesbase])

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

  let {movesLayer:movesLayers, depotsLayer:depotsLayers} = widgetParam

  if(movesLayers === undefined){
    movesLayers = ["",{}]
  }

  if(depotsLayers === undefined){
    depotsLayers = ["",{}]
  }

  const getLayer = ()=>{
    const sizeScale = orbitViewSw ? 1:React.useMemo(()=>(Math.max(17 - viewport.zoom,2)**2)*2,[viewport.zoom]);
    const returnLayer = []
    if(movedData.length > 0){
      for(let i=0; i<movesLayers.length; i=i+1){
        const movesLayer = movesLayers[i]
        if(movesLayer === "TextLayer"){
          const assignProps = JSON.parse(movesLayers[i+1])
          returnLayer.push(new TextLayer({ id: 'TextLayer', data: movedData,
            coordinateSystem: orbitViewSw ? COORDINATE_SYSTEM.CARTESIAN : COORDINATE_SYSTEM.DEFAULT,
            getPosition: x => x.position, getText: x => x[textStr] || "", getColor: x => x[textColorStr] || [255,255,255,255],
            characterSet: 'auto', sizeUnits: orbitViewSw ? "pixels":"meters", getSize: (textSiza*(orbitViewSw ? 1:10)),
            getTextAnchor: 'start', pickable: true, onHover,
            ...assignProps
          }))
        }else
        if((movesLayer === "MovesLayer") && !orbitViewSw){
          const assignProps = JSON.parse(movesLayers[i+1])
          const iconlayer = (!state.iconChange ? 'Scatterplot':
            state.iconCubeType === 0 ? 'SimpleMesh':state.iconCubeType === 1 ? 'Scenegraph':'Scatterplot');
          returnLayer.push(new MovesLayer({ routePaths, movesbase, movedData, clickedObject, actions, onHover,
            optionVisible: state.moveOptionVisible, optionArcVisible: state.moveOptionArcVisible,
            optionLineVisible: state.moveOptionLineVisible, optionChange: state.optionChange, iconlayer,
            sizeScale: (iconlayer === 'SimpleMesh' ? sizeScale : (sizeScale/10)),
            iconDesignations:[{layer:iconlayer,getColor:x=>colorPallet[iconColor][0]||x[colorStr]||[0,255,0]}],
            ...assignProps
          }))
        }else
        if(movesLayer === "PointCloudLayer"){
          const assignProps = JSON.parse(movesLayers[i+1])
          returnLayer.push(new PointCloudLayer({ id: 'PointCloudLayer', data: movedData,
              coordinateSystem: orbitViewSw ? COORDINATE_SYSTEM.CARTESIAN : COORDINATE_SYSTEM.DEFAULT,
              getPosition: x => x.position, getColor:x=>colorPallet[iconColor][0]||x[colorStr]||[0,255,0],
              pointSize: pointSiza, pickable: true, onHover,
              ...assignProps
            })
          )
        }else
        if((movesLayer === "Heatmap3dLayer") && !orbitViewSw){
          const assignProps = JSON.parse(movesLayers[i+1])
          const heatmapData = movedData.reduce((heatmapData,x)=>{
            const elevation = x[elevationStr]===undefined ? 1 : x[elevationStr]
            if(x.position){
              const heatmapArea_long = heatmapArea * distance_rate[0]
              const heatmapArea_lati = heatmapArea * distance_rate[1]
              const Grid_longitude = Math.floor(x.position[0]/heatmapArea_long)*heatmapArea_long
              const Grid_latitude = Math.floor(x.position[1]/heatmapArea_lati)*heatmapArea_lati
              const findIdx = heatmapData.findIndex((x)=>(x.Grid_longitude === Grid_longitude && x.Grid_latitude === Grid_latitude))
              if(findIdx < 0){
                heatmapData.push({
                  Grid_longitude, Grid_latitude, elevation,
                  coordinates:[
                    [Grid_longitude, Grid_latitude],[Grid_longitude+heatmapArea_long, Grid_latitude],
                    [Grid_longitude+heatmapArea_long, Grid_latitude+heatmapArea_lati],
                    [Grid_longitude, Grid_latitude+heatmapArea_lati]
                  ]
                })
              }else{
                heatmapData[findIdx].elevation = heatmapData[findIdx].elevation + elevation
              }
            }
            return heatmapData
          },[])
          const maxValue = Math.max(heatmapColor.length,heatmapMaxValue,
            heatmapData.reduce((heatmapMaxValue,x)=>Math.max(heatmapMaxValue,x.elevation),0)
          )
          const maxidx = heatmapColor.length - 1
          const denominator = (maxValue/heatmapColor.length)
        
          returnLayer.push(new PolygonLayer({ id: 'Heatmap3dLayer', data: heatmapData,
              extruded: true, wireframe: false,
              getPolygon: (x) => x.coordinates,
              getFillColor: (x) => heatmapColor[Math.min(maxidx,Math.floor((x.elevation-1)/denominator))],
              getLineColor: null,
              getElevation: (x) => x.elevation || 0, elevationScale: 100,
              opacity: 0.5, pickable: true, onHover,
              ...assignProps
          }))
        }else
        if((movesLayer === "Heatmap2dLayer") && !orbitViewSw){
          const assignProps = JSON.parse(movesLayers[i+1])
          returnLayer.push(new HeatmapLayer({ id: 'Heatmap2dLayer', data: movedData,
              getPosition: x => x.position, getWeight: x => x[elevationStr] || 1,
              colorRange: heatmapColor, pickable: true, onHover,
              ...assignProps
          }))
        }else
        if(movesLayer === "ScatterplotLayer"){
          const assignProps = JSON.parse(movesLayers[i+1])
          returnLayer.push(new ScatterplotLayer({ id: 'ScatterplotLayer', data: movedData,
              coordinateSystem: orbitViewSw ? COORDINATE_SYSTEM.CARTESIAN : COORDINATE_SYSTEM.DEFAULT,
              getPosition: x => x.position, getColor:x=>colorPallet[iconColor][0]||x[colorStr]||[0,255,0],
              getRadius: pointSiza, pickable: true, onHover, billboard: true, radiusUnits: orbitViewSw ? "pixels":"meters",
              ...assignProps
            })
          )
        }else
        if(movesLayer === "GridCellLayer"){
          const assignProps = JSON.parse(movesLayers[i+1])
          returnLayer.push(new GridCellLayer({ id: 'GridCellLayer', data: movedData,
              coordinateSystem: orbitViewSw ? COORDINATE_SYSTEM.CARTESIAN : COORDINATE_SYSTEM.DEFAULT,
              getPosition: x => x.position, getColor:x=>colorPallet[iconColor][0]||x[colorStr]||[0,255,0],
              getElevation: x => x[elevationStr] || 1,
              cellSize: cellSize, opacity: 0.5, pickable: true, onHover,
              ...assignProps
            })
          )
        }
      }
    }
    if(depotsData.length > 0 && !orbitViewSw){
      const iconlayer = (!state.iconChange ? 'Scatterplot':'SimpleMesh');
      for(let i=0; i<depotsLayers.length; i=i+1){
        const depotsLayer = depotsLayers[i]
        if(depotsLayer === "DepotsLayer"){
          const assignProps = JSON.parse(depotsLayers[i+1])
          returnLayer.push(new DepotsLayer({ depotsData, onHover,
            optionVisible: state.depotOptionVisible, optionChange: state.optionChange, iconlayer,
            iconDesignations:[{layer:iconlayer, getColor:x=>colorPallet[dpIconColor][0]||x.color||[166,89,166]}],
            ...assignProps
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

  const getMapStyle = ()=>{
    if(widgetParam.mapboxApiKey === ""){
      return {
        mapStyle:'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        mapboxAddLayerValue:null
      }
    }else{
      return {mapboxApiAccessToken:widgetParam.mapboxApiKey}
    }
  }
  const harmoVisLayersProps = {
    ...getMapStyle(),viewport,actions,layers:getLayer()
  }
  const deckgLProps = {views:new OrbitView({orbitAxis: 'Z', fov: 50}), viewState, controller:{scrollZoom:{smooth:true}},
    onViewStateChange:v => updateViewState(v.viewState), layers:getLayer()
  }
  const controllerProps = {...props, status:state, movesLayers, depotsLayers,
    pointSiza, setPointSiza, textSiza, setTextSiza, iconColor, setIconColor, dpIconColor, setDpIconColor,
    orbitViewScale, setOrbitViewScale, getMoveOptionChecked, getMoveOptionArcChecked, getMoveOptionLineChecked,
    getDepotOptionChecked, getOptionChangeChecked, getIconChangeChecked, getIconCubeTypeSelected, heatmapColor,
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
