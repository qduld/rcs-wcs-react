import React , { useState, useEffect , forwardRef, useImperativeHandle } from 'react';
import { connect , useIntl } from 'umi';
import styles from './style.less';

interface PowerInfo{
    percent: number,
    charging?: boolean
}

interface PowerShowProps{
    powerInfo: PowerInfo,
}

const powerOutList = [
    {x:0,y:0,rx:6,ry:6,width:40,height:20,fill:'white',stroke:'black',type:'outline',class:""},
    {x:40,y:4,rx:2,ry:2,width:2,height:12,fill:'black',stroke:'black',type:'top2',class:""}
]

interface powerRateInit{
    x: number;
    y: number;
    rx: number;
    ry: number;
    width: number;
    height: number;
    fill: string;
    stroke: string;
    type: string;
    display: string;
    class: string;
    strokeWidth:string;
}

const PowerShow: React.FC<PowerShowProps> = (props) => {
    const { powerInfo } = props
    const { formatMessage } = useIntl();
    let [powerRate,setPowerRate] = useState<powerRateInit>({x:2,y:2,rx:1,ry:1,width:36,height:16,fill:'#00AA00',stroke:'#00AA00',type:'power1',display:'inline-block',class:"",strokeWidth:'2px'});

    useEffect(()=>{                     //监听动作列表返回
        let powerRateInit={x:2,y:2,rx:1,ry:1,width:36,height:16,fill:'#00AA00',stroke:'#00AA00',type:'power1',display:'inline-block',class:"",strokeWidth:'2px'};
        powerRateInit.width = 36*powerInfo.percent/100
        if(powerInfo.percent<=20){
            powerRateInit.fill="#FB2518"
            powerRateInit.stroke="#FB2518"
            powerOutList[0].class="warning-animate"
            powerOutList[0].stroke="#FB2518"
        }else{
            powerOutList[0].class=""
            powerOutList[0].stroke="black"
        }
        setPowerRate(powerRateInit)
    },[powerInfo])

    const renderPowerWrapper = ()=>{
       return powerOutList.map((powerItem:any)=>{                    
            return <rect
                    key={powerItem.type}
                    x={powerItem.x}
                    y={powerItem.y}
                    rx={powerItem.rx}
                    ry={powerItem.ry}
                    width={powerItem.width}
                    height={powerItem.height}
                    fill={powerItem.fill}
                    stroke={powerItem.stroke}
                    strokeWidth={powerItem.strokeWidth}
                />
         })
    }

    return (
            <svg className={styles.powerWrapper}>
                <g>                                                                      
                    {renderPowerWrapper()}
                    <rect
                        key={powerRate.type}
                        x={powerRate.x}
                        y={powerRate.y}
                        rx={powerRate.rx}
                        ry={powerRate.ry}
                        width={powerRate.width}
                        height={powerRate.height}
                        fill={powerRate.fill}
                        stroke={powerRate.stroke}
                        strokeWidth={powerRate.strokeWidth}
                    />
                    {powerInfo.charging?                    
                        <polygon 
                            points={"chargingIcon"}
                            style={{fill:"red",stroke:"red",strokeWidth:"1"}}/>
                        :''
                    }
                </g>  
            </svg>
      );
    };

export default connect(({ loading }: { loading: { effects: { [key: string]: boolean } } }) => ({}))(PowerShow);