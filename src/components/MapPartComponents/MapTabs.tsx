import React , { useState , forwardRef , useImperativeHandle, useEffect } from 'react';
import styles from './style.less';
import { Button } from 'antd'

interface tabsProps {
    tabs:Array<any>
    activeTab:string,
    setActiveTab:Function
}
const MapTabs = forwardRef((props:tabsProps,ref) => { 
// const MapTabs: React.FC<tabsProps> = (props) => {
    const { tabs , setActiveTab } = props      //格点、工位、绘制参数、当前楼层

    let [mapTabsVis, setMapTabsVis] = useState<Boolean>(true)
    let [collapseVis,setCollapseVis] = useState<Boolean>(true)//选层面板折叠开关
    let [isAllStairsBtnActive,setIsAllStairsBtnActive]=useState<'default'|'primary'>('default')
    useImperativeHandle(ref, () => ({
        handleTabChange:changeActiveTab,
      }));

    useEffect(()=>{
        if(tabs.length==0){
            setCollapseVis(false)
        }else{
            setCollapseVis(true)
        }
    },[tabs,tabs.length]) 

    const changeActiveTab = (index:number)=>{
        if(tabs[index]){
            tabs.forEach((item)=>{
                if(item.isActive==='primary'){
                    item.isActive = 'default'
                }
            })
            setIsAllStairsBtnActive('default')
            tabs[index].isActive = 'primary'
            setActiveTab(index)
        }
    }
    const changeActiveTabToAllR=()=>{
        // tabs.forEach((item)=>{
        //     if(item.isActive==='primary'){
        //         item.isActive = 'default'
        //     }
        // })
        // setIsAllStairsBtnActive('primary')

    }
    // tabs.push(
    //     {title:'ALL'}
    // )
    const liItem = tabs.map((item:{title:'',isActive:'default'},index)=>{
        return (
        <li key={index}>
            <Button type={item.isActive} onClick={()=>{changeActiveTab(index)}}>{item.title}</Button>
        </li>
        )
    })

    const changeMapTabsVis=()=>{
        setMapTabsVis(!mapTabsVis)
    }

    const stylesRender=()=>{
        return mapTabsVis?[styles.collapse,styles.collapseHidden].join(' '):[styles.collapse,styles.collapseRight].join(' ')
    }

    return (
        <div className={mapTabsVis?styles.mapTabs:[styles.mapTabs,styles.mapTabsHidden].join(' ')}>
            <ul>
              {liItem}
                {/* <li key={tabs.length}>
                    <Button type={isAllStairsBtnActive} onClick={()=>{changeActiveTabToAllR()}}>R全</Button>
                </li> */}
              {collapseVis?
                <li>
                    <Button className={styles.collapse} onClick={()=>{changeMapTabsVis()}} title="隐藏">
                        <i className="ion-md-arrow-dropleft"></i>
                    </Button>
                </li>:''
              }
            </ul>
            {collapseVis?
                <Button className={stylesRender()} onClick={()=>{changeMapTabsVis()}} title="显示">
                    <i className="ion-md-arrow-dropright"></i>
                </Button>:''
            }
        </div>
      );
    });

export default MapTabs;
