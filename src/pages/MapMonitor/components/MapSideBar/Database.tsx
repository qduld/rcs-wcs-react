import React , { useEffect, useState , useMemo } from 'react';
import { connect , Dispatch } from 'umi';
import styles from './style.less';
import { Card , Table } from 'antd'

interface DatabaseProps {
    dispatch: Dispatch;
}

const Database: React.FC<DatabaseProps> = (props) => {
    const [allAction,setAllAction] = useState<Array<any>>([]);
    const [allDDL,setAllDDL] = useState<Array<any>>([]);
  
    useEffect(()=>{
        getAllAction()
        getAllDDL()
    },[])

    const computeActionGroup = (actionData:Array<object>)=>{
        if(actionData.length>0){
            let acList = Array<any>()
            actionData.forEach((outItem:any,outIdx:number)=>{
                if(outItem.actionGroup){
                    let agLabel = ''
                    outItem.actionGroup.forEach((inItem:any,inIdx:number)=>{
                        if(outItem.actionGroup.length-1 === inIdx ){
                            agLabel+=inItem.code+inItem.ddlCode
                        }else{
                            agLabel+=inItem.code+inItem.ddlCode+'->'
                        }
                    
                    })
                    outItem.action.acGroupLabel = agLabel
                }
                outItem.action.idx = outIdx
                acList.push(outItem.action)
            })
            return acList
        }else{
            return []
        }
    }

    const computeDDL = (ddlData:Array<object>)=>{
        if(ddlData.length>0){
            ddlData.forEach((item:any,idx:number)=>{
                item.idx = idx
            })
            return ddlData
        }else{
            return []
        }
    }

    const getAllAction=()=>{               //获取所有动作
        const {dispatch} = props
        dispatch({
            type: 'mapAndMonitor/fetchAllAction',
            callback: (resp:any) => {
                if(resp){
                    setAllAction(resp)
                }
            }
        });
    }

    const getAllDDL=()=>{               //获取所有动作
        const {dispatch} = props
        dispatch({
            type: 'mapAndMonitor/fetchAllDDL',
            callback: (resp:any) => {
                if(resp){
                    setAllDDL(resp)
                }
            }
        });
    }

    const actionGroupCol = [                 //列数据
        {
          title: '序号',
          dataIndex: 'idx',
          key: 'idx',
          width:'60px',
        },
        {
          title: '码值',
          dataIndex: 'code',
          key: 'code',
        },
        {
          title: '指令序列',
          dataIndex: 'acGroupLabel',
          key: 'acGroupLabel',
          ellipsis:true
        }
    ];

    const ddlCol = [
        {
          title: '序号',
          dataIndex: 'idx',
          key: 'idx',
          width:'60px'
        },
        {
          title: '命令',
          dataIndex: 'ddlCode',
          key: 'ddlCode',
        },
        {
          title: '名称',
          dataIndex: 'ddlName',
          key: 'ddlName',
          ellipsis:true
        },
    ];

    const memoizedActionGroup = useMemo(() =>computeActionGroup(allAction), 
    [allAction]);

    const memoizedDDL = useMemo(() =>computeDDL(allDDL), 
    [allDDL]);

    return (
        <div className={styles.databaseWrapper}>
            <Card title="点信息" className={styles.pointInfo}>
                <Table 
                rowKey={''+Math.random()}
                    columns={actionGroupCol}
                    dataSource={memoizedActionGroup}
                    pagination={{size:"small"}}/>
            </Card>
            <Card title="指令集合" className={styles.actionGroup}>
                <Table 
                rowKey={''+Math.random()}
                    columns={ddlCol} 
                    dataSource={memoizedDDL}
                    pagination={{size:"small"}}/>
            </Card>
        </div>
      );
    };

export default connect(() => ({}))(Database);