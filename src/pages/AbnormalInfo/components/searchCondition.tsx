import React , { useEffect, useState , useRef } from 'react';
import { connect , Dispatch , useIntl } from 'umi';
import styles from '../style.less';
import { Form , Select , Radio , notification } from 'antd';

const { Option } = Select

interface searchItem{
    value:string,
    label:string
}

interface SearchProps{
    abnormalType:Array<searchItem>,
    changeFilterType:Function,
    filterType:string
}

const SearchCondition: React.FC<SearchProps> = (props) => {
    const { abnormalType , changeFilterType , filterType } = props

    const { formatMessage } = useIntl();

    const [searchForm] = Form.useForm()

    // const commonRule = {
    //     required: true,
    //     message: formatMessage({ id: 'global.common.required' })
    // }

    const radioRender = ()=>{
        let abnormalList = []
        abnormalList = abnormalType.map((item:any,index:number)=>{
            let checked = false
            if(item.value == filterType){
                checked = true
            }
            return <Option value={item.value} 
                        key={item.value+index} 
                        // checked={checked}
                        // onClick={(e)=>{radioClick(e)}}
                        >{item.label}</Option>
        })
        abnormalList.unshift(
            <Option value={'all'} 
                    key={'all'} 
                    // checked={checked}
                    // onClick={(e)=>{radioClick(e)}}
                    >{'全部'}</Option>
        )
        // abnormalList.push(
        //     <Radio value={"all"} 
        //                 key={""+abnormalList.length+1} 
        //                 checked={filterType === 'all'?true:false}
        //                 // className={styles.checkHidden}
        //                 >{"all"}</Radio>
        // )
        return abnormalList
    }

    // const radioClick = (event:any)=>{
    //     const { filterType } = props
    //     if(!event.target.checked){
    //         changeFilterType()
    //     }else{
    //         if(filterType === event.target.value){
    //             changeFilterType()
    //         }else{
    //             changeFilterType(event.target.value)
    //         }
    //     }
    // }

    return (
        <Form form={searchForm}
            className={styles.abnormalForm} 
            labelAlign="right">
                <Form.Item label="故障类型"
                   >
                        <Select defaultValue={'all'}
                            onChange={(e:any)=>changeFilterType(e)}>
                            {radioRender()}
                        </Select>
                </Form.Item>
        </Form>
    )
};

export default connect(({ loading }: { loading: { effects: { [key: string]: boolean } } }) => ({}))(SearchCondition);
