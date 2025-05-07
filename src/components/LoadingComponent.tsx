/* eslint-disable jsx-a11y/alt-text */
import loading_png from '../images/loading.svg'
export const LoadingComponent = ({ style, divStyle, isTerminal }: { style?: React.CSSProperties, divStyle?: React.CSSProperties, isTerminal?: boolean }): JSX.Element => {
    return <div style={divStyle ? divStyle : { width: '100%', textAlign: 'center', top: '50%' }}>
        <img
            className="widget-thumb-icon"
            src={loading_png}
            alt="Loading"
            style={style ? style : { width: isTerminal ? '18%' : '50%', paddingTop: isTerminal ? '30vh' : 0 }}
        />
        {/* {isTerminal && <h2 style={{ marginTop: -70 }}>BCFLEX Loading</h2>} */}


    </div>

}