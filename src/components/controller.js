import * as React from 'react';
import { AddMinutesButton, PlayButton, PauseButton, ReverseButton, ForwardButton, ElapsedTimeRange, ElapsedTimeValue,
  SpeedRange, SpeedValue, SimulationDateTime } from 'harmoware-vis';
import {colorPallet} from '../containers/app'
import CanvasComponent from './canvas'
 
const Checkbox = React.memo(({id,onChange,title,className='harmovis_input_checkbox',checked})=>
  <><input type="checkbox" id={id} onChange={onChange} className={className} checked={checked} />
  <label htmlFor={id} title={title}>{title}</label></>)

const Controller = (props)=>{
  const { settime, timeBegin, timeLength, actions, multiplySpeed, animatePause, animateReverse, leading, movedData, depotsData,
    getMoveOptionChecked, getMoveOptionArcChecked, getDepotOptionChecked, getOptionChangeChecked, getIconChangeChecked,
    getIconCubeTypeSelected, getMoveOptionLineChecked, status, pointSiza, textSiza, iconColor, dpIconColor, orbitViewScale,
    movesLayers, depotsLayers, widgetParam:{orbitViewSw=false} } = props;

  const setOrbitViewScale = (e)=>{
    props.setOrbitViewScale(+e.target.checked);
  }

  const setPointSiza = (e)=>{
    props.setPointSiza(+e.target.value);
  }

  const setTextSiza = (e)=>{
    props.setTextSiza(+e.target.value);
  }

  const setIconColor = (e)=>{
    props.setIconColor(+e.target.value);
  }

  const setDpIconColor = (e)=>{
    props.setDpIconColor(+e.target.value);
  }

  const listExpansion = (id)=>{
    let obj=document.getElementById(id).style;
    obj.display=(obj.display==='none')?'block':'none';
  }

  const IconSelect = ()=>{
    if(!orbitViewSw&&((movesLayers.includes("MovesLayer")&&movedData.length > 0)||(depotsLayers.includes("DepotsLayer")&&depotsData.length > 0))){
      return(<>
        <li className="flex_row">
          <Checkbox id="IconChangeChecked" onChange={getIconChangeChecked} title='アイコン表示パターン切替' checked={status.iconChange} />
        </li>
        <li className="flex_row">
          <div className="form-select" title='３Ｄアイコン表示タイプ切替'>
            <label htmlFor="IconCubeTypeSelect">３Ｄアイコン表示タイプ切替</label>
            <select id="IconCubeTypeSelect" value={status.iconCubeType} onChange={getIconCubeTypeSelected} className="harmovis_select">
            <option value="0">SimpleMeshLayer</option>
            <option value="1">ScenegraphLayer</option>
            </select>
          </div>
        </li>
      </>)
    }
    return(<></>)
  }

  const MoveIconOption = ()=>{
    if(!orbitViewSw&&(movesLayers.includes("MovesLayer")&&movedData.length > 0)){
      return(<>
        <li className="flex_row">
          <Checkbox id="MoveOptionChecked" onChange={getMoveOptionChecked} title='運行データグラフ表示' checked={status.moveOptionVisible} />
        </li>
        <li className="flex_row">
          <Checkbox id="MoveOptionArcChecked" onChange={getMoveOptionArcChecked} title='運行データアーチ表示' checked={status.moveOptionArcVisible} />
        </li>
        <li className="flex_row">
          <Checkbox id="MoveOptionLineChecked" onChange={getMoveOptionLineChecked} title='運行データライン表示' checked={status.moveOptionLineVisible} />
        </li>
      </>)
    }
    return(<></>)
  }

  const DepotIconOption = ()=>{
    if(!orbitViewSw&&(depotsLayers.includes("DepotsLayer")&&depotsData.length > 0)){
      return(
        <li className="flex_row">
          <Checkbox id="DepotOptionChecked" onChange={getDepotOptionChecked} title='停留所データオプション表示' checked={status.depotOptionVisible} />
        </li>
      )
    }
    return(<></>)
  }

  const IconOption = ()=>{
    if(!orbitViewSw&&((movesLayers.includes("MovesLayer")&&movedData.length > 0)||(depotsLayers.includes("DepotsLayer")&&depotsData.length > 0))){
      return(
        <li className="flex_row">
          <Checkbox id="OptionChangeChecked" onChange={getOptionChangeChecked} title='オプション表示パターン切替' checked={status.optionChange} />
        </li>
      )
    }
    return(<></>)
  }

  const PointSize = ()=>{
    if(movesLayers.includes("PointCloudLayer")&&movedData.length > 0){
      return(
        <li className="flex_column">
        <label htmlFor="setPointSiza">{`ポイントサイズ=${pointSiza}`}</label>
          <input type="range" value={pointSiza} min={0} max={10} step={0.1} onChange={setPointSiza}
            className='harmovis_input_range' id='setPointSiza' title={pointSiza}/>
        </li>
      )
    }
    return(<></>)
  }

  const TextSize = ()=>{
    if(movesLayers.includes("TextLayer")&&movedData.length > 0){
      return(
        <li className="flex_column">
        <label htmlFor="setTextSiza">{`テキストサイズ=${textSiza}`}</label>
          <input type="range" value={textSiza} min={0} max={10} step={0.1} onChange={setTextSiza}
            className='harmovis_input_range' id='setTextSiza' title={textSiza}/>
        </li>
      )
    }
    return(<></>)
  }

  const MovedIconColor = ()=>{
    if((movesLayers.includes("MovesLayer")||movesLayers.includes("PointCloudLayer"))&&movedData.length > 0){
      return(
        <li className="flex_row">
          <div className="form-select" title='移動アイコン色'>
            <label htmlFor="IconColorSelect">移動アイコン色</label>
            <select id="IconColorSelect" value={iconColor} onChange={setIconColor} className="harmovis_select">
            {colorPallet.map((col,idx)=><option value={idx} key={idx}>{col[1]}</option>)}
            </select>
          </div>
        </li>
      )
    }
    return(<></>)
  }

  const DepotIconColor = ()=>{
    if(!orbitViewSw&&(depotsLayers.includes("DepotsLayer")&&depotsData.length > 0)){
      return(
        <li className="flex_row">
          <div className="form-select" title='固定アイコン色'>
            <label htmlFor="DpIconColorSelect">固定アイコン色</label>
            <select id="DpIconColorSelect" value={dpIconColor} onChange={setDpIconColor} className="harmovis_select">
            {colorPallet.map((col,idx)=><option value={idx} key={idx}>{col[1]}</option>)}
            </select>
          </div>
        </li>
      )
    }
    return(<></>)
  }

  const OrbitViewScale = ()=>{
    if(orbitViewSw){
      return(
        <li className="flex_row">
          <Checkbox id="OptionChangeChecked" onChange={setOrbitViewScale} title='基準線表示' checked={orbitViewScale} />
        </li>
      )
    }
    return(<></>)
  }

  const heatmapColorBar = ()=>{
    if(!orbitViewSw&&(movesLayers.includes("Heatmap3dLayer")&&movedData.length > 0)){
      const width = document.getElementById("harmovis_controller").clientWidth
      return(
        <li className="flex_column">
          <label htmlFor="heatmapColor">カラースケール</label>
          <CanvasComponent id="heatmapColor" width={width} heatmapColor={props.heatmapColor} />
        </li>
      )
    }
    return(<></>)
  }

  return (
    <div className="harmovis_controller" id="harmovis_controller">
      <ul>
        <li className="flex_column">
          {React.useMemo(()=>
            <span onClick={listExpansion.bind(Controller,'expand1')} >
              <a style={{'cursor':'pointer'}} >▼ 表示切替スイッチパネル</a>
            </span>
          ,[])}
          <ul>
            <span id="expand1" style={{'display': 'none','clear': 'both'}}>
              {IconSelect()}
              {MoveIconOption()}
              {DepotIconOption()}
              {IconOption()}
              {PointSize()}
              {TextSize()}
              {MovedIconColor()}
              {DepotIconColor()}
              {OrbitViewScale()}
            </span>
          </ul>
        </li>
        {React.useMemo(()=>
          <><li className="flex_row">
              {animatePause ? <PlayButton actions={actions} /> : <PauseButton actions={actions} />}
              {animateReverse ? <ForwardButton actions={actions} /> : <ReverseButton actions={actions} />}
            </li>
            <li className="flex_row">
              <AddMinutesButton addMinutes={-5} actions={actions} />
              <AddMinutesButton addMinutes={5} actions={actions} />
            </li><li></li>
          </>
        ,[animatePause,animateReverse])}
        <li className="flex_row">
          再現中日時&nbsp;<SimulationDateTime settime={settime} />
        </li>
        <li></li>
        <li className="flex_column">
          <label htmlFor="ElapsedTimeRange">経過時間
          <ElapsedTimeValue settime={settime} timeBegin={timeBegin} timeLength={timeLength} actions={actions} min={leading*-1} />&nbsp;/&nbsp;
          <input type="number" value={timeLength} onChange={e=>actions.setTimeLength(+e.target.value)} className="harmovis_input_number" min={0} max={timeLength} />&nbsp;秒
          </label>
          <ElapsedTimeRange settime={settime} timeLength={timeLength} timeBegin={timeBegin} actions={actions} min={leading*-1} id="ElapsedTimeRange" />
        </li>
        {React.useMemo(()=>
          <li className="flex_column">
            <label htmlFor="SpeedRange">スピード<SpeedValue multiplySpeed={multiplySpeed} actions={actions} />倍速</label>
            <SpeedRange multiplySpeed={multiplySpeed} actions={actions} id="SpeedRange" />
          </li>
        ,[multiplySpeed])}
        {heatmapColorBar()}
      </ul>
    </div>
  );
}
export default Controller
