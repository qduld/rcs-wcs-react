import React , { useState, useEffect } from 'react';
import { connect , useIntl } from 'umi';
import styles from './style.less';

interface TipsProps{
    type?:'primary' | 'error' | 'info' | 'warning' | 'success',
    bgColor?:string,
    contentColor?:string
}

const TipsIcon: React.FC<any> = (props:TipsProps) => {
    let { type , bgColor , contentColor } = props

    const { formatMessage } = useIntl();
    let [bgColorS,setBgColorS] = useState<string>('#409EFF');
    let [contentColorS,setContentColorS] = useState<string>('#AAAAAA');

    useEffect(()=>{
       updateColorSet()
    },[type,bgColor,contentColor])

    const updateColorSet=()=>{
        if(bgColor){
            setBgColorS(bgColor)
        }else{
            switch(type){
                case 'success':setBgColorS('#E6A23C');break;  
                case 'warning':setBgColorS('#1890ff');break;
                case 'error':setBgColorS('#FA0000');break;
                case 'info':setBgColorS('#1890ff');break;
                default:setBgColorS('#409EFF');   
            }
        }
        if(contentColor){
            setBgColorS(contentColor)
        }
    }

    return (
            <svg className={styles.graphWrapper}>
                <g>                                                                          
                    <path 
                        name="triangle" 
                        fill={bgColorS}
                        stroke={bgColorS} 
                        d="M24 1 L1 47 Q0 50 2 50 L47 50 Q50 50 49 47 L26 1 Q25 0 24 1 Z"
                    />
                    <rect
                        x={22}
                        y={14}
                        rx={2}
                        ry={2}
                        width={6}
                        height={20}
                        fill={contentColorS}
                        stroke={contentColorS}
                        strokeWidth={1}
                    />
                    <rect
                        x={22}
                        y={38}
                        rx={2}
                        ry={2}
                        width={6}
                        height={6}
                        fill={contentColorS}
                        stroke={contentColorS}
                        strokeWidth={1}
                    />
                </g>  
                    {/* <g>
                        <rect fill="#fff" id="canvas_background" height="819" width="1662" y="-1" x="-1"/>
                        <g display="none" overflow="visible" y="0" x="0" height="100%" width="100%" id="canvasGrid">
                            <rect fill="url(#gridpattern)" stroke-width="0" y="0" x="0" height="100%" width="100%"/>
                        </g>
                    </g> */}
            </svg>
      );
    };

export default connect(({ loading }: { loading: { effects: { [key: string]: boolean } } }) => ({}))(TipsIcon);