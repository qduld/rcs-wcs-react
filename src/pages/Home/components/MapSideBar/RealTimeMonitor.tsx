import React, { useEffect, useState, useRef } from 'react';
import { connect, Dispatch, useIntl } from 'umi';
import styles from './style.less';
import { Card, Table, notification } from 'antd';
import TipsIcon from '@/components/SVG/TipsIcon';
import { AgvInfoState, agvInfoInit } from '../data.d';
import usePrevious from '@/utils/customeEffect';
import { StateType } from '@/components/MapPartComponents/data.d';
import { LOStorage, formatDate } from '@/utils/utils';
import moment from 'moment';

interface AgvProps {
    dispatch: Dispatch,
    exceptionList: Array<Object>,
    allAgvList: string,
    updateAgvListStatus: Function,
}

interface AbnormalState {
    deviceId: string,
    deviceName: string,
    errorType: string,
    errorDate: string,
    errorStatus: string,
    deviceType: string,
}

interface AgvVolSetState {
    agvId: string,
    agvVoltageLow: number,
    agvVoltageFull: number,
}

const RealTimeMonitor: React.FC<AgvProps> = (props) => {
    const { exceptionList, allAgvList, updateAgvListStatus } = props;

    let [agvListStatus, setAgvListStatus] = useState<Array<AgvInfoState>>([]);
    let [abnormalList, setAbnormalList] = useState<Array<AbnormalState>>([]);

    let agvStatusCur = useRef<Array<AgvInfoState>>([]);
    let agvListCur = useRef();
    let prevAgvList: (string | any) = usePrevious(allAgvList);
    let agvVolSet = useRef<Array<AgvVolSetState>>([]);

    const agvCol = [
        {
            title: '车辆编号',
            dataIndex: 'agvId',
            fixed: true,
            render: (text: any, record: any, index: number) => {
                return <span key={index}>{(record.agvId + "").toUpperCase()}</span>
            }
        },
        {
            title: '当前状态',
            dataIndex: 'missionName',
            fixed: true,
            ellipsis: true
        },
        {
            title: '当前码值',
            dataIndex: 'agvCode',
            fixed: true,
            ellipsis: true
        },
        {
            title: '当前电量',
            dataIndex: 'voltage',
            fixed: true,
            render: (text: any, record: any, index: number) => {
                let powerObj = computePower(text, record.agvId)
                return <div key={index} style={{
                    width: '100%', height: '100%', textAlign: 'center', position: 'absolute', lineHeight: '38px',
                    transform: 'translate(0, -50%)', background: powerObj.color
                }}>{powerObj.percent + '%'}</div>
            }
        }
    ]

    const abnormalCol = [
        {
            title: 'No.',
            dataIndex: 'id',
            fixed: true,
            render: (text: any, record: any, index: number) => {
                return <span key={index}>{(index + 1)}</span>
            },
            width: 40
        },
        {
            title: '故障设备',
            dataIndex: 'deviceName',
            fixed: true,
            render: (text: any, record: any, index: number) => {
                return <span key={index}>{(text + "").toUpperCase()}</span>
            }
        },
        {
            title: '故障时间',
            dataIndex: 'errorDate',
            ellipsis: true,
            fixed: true,
            width: 120,
        },
        {
            title: '故障类型',
            dataIndex: 'errorType',
            ellipsis: true,
            fixed: true,
        },
        // {
        //     title: '当前状态',
        //     dataIndex: 'errorStatus'
        // }
    ]

    useEffect(() => {
        // let exceptionLS = LOStorage.getItem('wi_exception_list')
        getAllAgv()
        // setAbnormalList(exceptionLS?JSON.parse(exceptionLS):[])
        getAllAgvStatus()
    }, [])

    useEffect(() => {
        if (prevAgvList && allAgvList) {
            let preAgvListObj = JSON.parse(prevAgvList)
            let allAgvListObj = JSON.parse(allAgvList)
            agvListCur.current = allAgvListObj
            orgAgvStatus(agvListCur.current, agvStatusCur.current)
            for (let agvId in preAgvListObj) {
                if (preAgvListObj[agvId].agv_state != allAgvListObj[agvId].agv_state) {            //如果有小车从空闲变成非空闲状态就调用一次Agv状态接口
                    // if( allAgvListObj[agvId].agv_state != 0 ){
                    getAllAgvStatus()
                    break;
                    // }
                }
            }
        }
    }, [allAgvList])

    useEffect(() => {
        let excListCache = []
        if (exceptionList && exceptionList.length > 0) {
            excListCache = exceptionList.map((item: any, index: number) => {
                item.key = item.deviceId + index
                // 故障时间问题点
                console.log(typeof item.errorDate)
                // let errorDate = moment(item.errorDate).format('YYYY MM DD HH mm ss')
                let errorDate = moment(item.errorDate).format('MMMM Do YYYY, h:mm:ss a')
                item.errorDate = errorDate
                return item
            })
        }
        console.log(excListCache)
        setAbnormalList(excListCache)
    }, [exceptionList, exceptionList.length])

    const computePower = (powerArg: string | number, agvId: string) => {
        let percentCompute = 0
        let color = "#95F204"
        let powerNum = Number(powerArg)
        if (agvVolSet.current && !agvVolSet.current instanceof Array) {
            return;
        }
        let volSetFilter = agvVolSet.current.find((item: any) => {
            return item.agvId === agvId
        })
        let volLowPecent = 30
        let volFulPecent = 90
        let volLow = 0
        let volFul = 0
        if (volSetFilter) {
            if (volSetFilter.agvVoltageLow >= 0) {
                volLow = volSetFilter.agvVoltageLow
            }
            if (volSetFilter.agvVoltageFull >= 0) {
                volFul = volSetFilter.agvVoltageFull
            }
        }
        if (powerNum) {
            if (powerNum < 30) {
                percentCompute = Math.floor((powerNum - 22) / 0.07)
                volLowPecent = Math.floor((volLow - 22) / 0.07)
                volFulPecent = Math.floor((volFul - 22) / 0.07)
            } else if (powerNum > 30) {
                percentCompute = Math.floor((powerNum - 40) / 0.14)
                volLowPecent = Math.floor((volLow - 40) / 0.14)
                volFulPecent = Math.floor((volFul - 40) / 0.14)
            }
            if (percentCompute < 0) {
                percentCompute = 0
            } else if (percentCompute > 100) {
                percentCompute = 100
            }
        }
        if (percentCompute >= 0 && percentCompute < volLowPecent) {
            color = "#D9001B"
        } else if (percentCompute >= volLowPecent && percentCompute < volFulPecent) {
            color = "#70B603"
        } else {
            color = "#95F204"
        }
        return { percent: percentCompute, color: color }
    }

    const getAllAgvStatus = () => {               //获取所有Agv状态
        const { dispatch } = props
        dispatch({
            type: 'homeAndMonitor/fetchAgvStatus',
            callback: (resp: any) => {
                if (resp) {
                    agvStatusCur.current = resp
                    orgAgvStatus(agvListCur.current, resp)
                }
            }
        });
    }

    const getAllAgv = () => {
        const { dispatch } = props;
        if (dispatch) {
            dispatch({
                type: 'agvMgt/fetchAllAgv',
                callback: (agvList: any) => {
                    agvVolSet.current = agvList
                }
            })
        }
    }

    const orgAgvStatus = (listData: Object | undefined, statusData: Array<AgvInfoState>) => {      //赋值Key 根据Id排序 
        let listStatusBack = []
        if (!listData || JSON.stringify(listData) == '{}') {
            listStatusBack = statusData.map((item: any, index: number) => {
                item.key = item.agvId
                item = Object.assign(JSON.parse(JSON.stringify(agvInfoInit)), item)
                return item
            }).sort(function compareAgvId(prev, curr) {
                return Number(prev.agvId.match(/\d+/g)[0]) - Number(curr.agvId.match(/\d+/g)[0])
            })
        } else {
            listStatusBack = statusData.map((item: any, index: number) => {
                if (listData[item.agvId]) {
                    item.voltage = listData[item.agvId].voltage
                    item.agvCode = listData[item.agvId].code
                    item.key = item.agvId
                }
                item.missionName = item.missionName ? item.missionName : '空闲'
                return item
            }).sort(function compareAgvId(prev, curr) {
                return Number(prev.agvId.match(/\d+/g)[0]) - Number(curr.agvId.match(/\d+/g)[0])
            })
        }
        if (listStatusBack.length > 0) {
            setAgvListStatus(listStatusBack)
            updateAgvListStatus(listStatusBack)
        }
    }

    const renderAbnormalDetails = () => {
        if (abnormalList.length > 0) {
            if (!abnormalList[0].deviceName) { return (<></>) }
            let spanContent = abnormalList[0].deviceName.toUpperCase() + ' ' + abnormalList[0].errorType
            return (
                <div className={styles.extraWrapper}>
                    <TipsIcon className={styles.errorIcon} type='error' />
                    <span className={styles.extraContent} title={spanContent}>{spanContent}</span>
                </div>
            )
        } else {
            return (<></>);
        }
    }


    return (
        <div className={styles.monitorWrapper}>
            <Card title="AGV车辆状态" className={[styles.agvStatus, styles.monitorCard].join(' ')}>
                <Table
                    rowKey={'' + Math.random()}
                    columns={agvCol}
                    dataSource={agvListStatus}
                    pagination={false}
                    bordered
                />
            </Card>
            <Card title="设备报警" className={[styles.agvAbnormal, styles.monitorCard].join(' ')} extra={renderAbnormalDetails()}>
                <Table
                    rowKey={'' + Math.random()}
                    columns={abnormalCol}
                    dataSource={abnormalList}
                    pagination={false}
                    bordered
                />
            </Card>
        </div>
    );
};

export default connect(
    (
        {
            loading,
            homeAndMonitor
        }: {
            loading: { effects: { [key: string]: boolean } }
            homeAndMonitor: StateType
        }) => ({
            exceptionList: homeAndMonitor.exceptionList || []
        }))(RealTimeMonitor);
