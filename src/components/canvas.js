import * as React from 'react';

const CanvasComponent = (props)=>{
  const canvas = React.useRef(undefined);
  const [context,setContext] = React.useState(undefined)
  const height = 30

  React.useEffect(()=>{
    if(canvas.current !== undefined){
      const context = canvas.current.getContext('2d');
      setContext(context);
    }
  },[canvas])

  React.useEffect(()=>{
    if(context !== undefined){
      const {width,heatmapColor} = props
      const sectionSize = width / heatmapColor.length
      context.clearRect(0,0,width,height);
      heatmapColor.forEach((color,idx)=>{
        context.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`
        context.fillRect((sectionSize*idx),0,sectionSize,height)
      })
    }
  },[context])

  return (
    <canvas ref={canvas} width={props.width} height={height} />
  )
}
export default CanvasComponent
