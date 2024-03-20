import React, { Component } from 'react';
import { connect } from 'umi';
import { MenuUnfoldOutlined , MenuFoldOutlined } from '@ant-design/icons';
import MapContext from '../context';
import { action } from './data.d'

import styles from './style.less';

import RealTimeMonitor from './MapSideBar/RealTimeMonitor'

interface MapSideBarProps {
    actionList : Array<action>,
    collapse: Boolean ,
    handleCollapse : ()=>void 
}

class MapSideBar extends Component<MapSideBarProps> {
  siteWrapper:any

  constructor(props:any) {
    super(props);
  }

  render() {
    let { actionList , collapse , handleCollapse } = this.props;
    return (
        <div className={!collapse?styles.mapSideBar:[styles.mapSideBar,styles.foldSideBar].join(' ')} id="sideBar">
                    <MapContext.Consumer>{(value)=>
                        <RealTimeMonitor
                           allAgvList={value.allAgvList}
                           updateAgvListStatus={value.updateAgvListStatus}
                        />
                      }
                      </MapContext.Consumer>
                <MenuUnfoldOutlined
                    className={styles.sideBarUnfold}
                    onClick={handleCollapse}
                />
                {collapse?
                <MenuFoldOutlined
                    className={styles.sideBarFold}
                    onClick={handleCollapse}
                />
                :''
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
    loading: loading.effects['homeAndMonitor/fetchRcsMap'],
  }),
)(MapSideBar);

