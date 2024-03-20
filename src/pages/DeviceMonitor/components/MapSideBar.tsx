import React, { Component } from 'react';
import { connect } from 'umi';
import { Tabs } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
const { TabPane } = Tabs;
import MapContext from '../context'

import styles from './style.less';

import AgvRunning from './MapSideBar/AgvRunning'
import Supplementary from './MapSideBar/Supplementary'

interface MapSideBarProps {
  actionList: Array<Object>,
  agvList: Object,
  collapse: Boolean,
  handleCollapse: () => void
}

class MapSideBar extends Component<MapSideBarProps> {
  siteWrapper: any

  constructor(props: any) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    let { actionList, agvList, collapse, handleCollapse, } = this.props;
    return (
      <div className={!collapse ? styles.mapSideBar : [styles.mapSideBar, styles.foldSideBar].join(' ')}>
        <Tabs defaultActiveKey="1" type="card" >
          <TabPane tab="AGV车辆" key="1">
            <MapContext.Consumer>{(value) =>
              <AgvRunning
                actionList={actionList}
                allAgvList={value.allAgvList}
                currentRegion={value.currentRegion}
                codeMapList={value.codeMapList}
                allDDL={value.allDDL}
                updateActionList={value.updateActionList}
              />
            }
            </MapContext.Consumer>
          </TabPane>
          <TabPane tab="辅助设备" key="2">
            <MapContext.Consumer>{(value) =>
              <Supplementary
              />
            }
            </MapContext.Consumer>
          </TabPane>
          {/* <TabPane tab="异常数据" key="3">
                    <AbnormalData/>
                </TabPane> */}
        </Tabs>
        <MenuUnfoldOutlined
          className={styles.sideBarUnfold}
          onClick={handleCollapse}
        />
        {collapse ?
          <MenuFoldOutlined
            className={styles.sideBarFold}
            onClick={handleCollapse}
          />
          : ''
        }
      </div>
    );
  }
};

export default connect(
  ({
    loading,
  }: {
    loading: {
      effects: { [key: string]: boolean };
    };
  }) => ({
    loading: loading.effects['deviceAndMonitor/fetchRcsMap'],
  }),
)(MapSideBar);

