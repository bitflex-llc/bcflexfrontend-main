import "../../css/redocfix.css"

import { API_ENDPOINT } from '../../API';
import { NavMenu } from "../NavMenu";
import React, { } from 'react';

const RedocStandalone = React.lazy(() => import('./RedocExport'));

export default function Api() {
    return (<>

        <NavMenu isSmall={true} />
        <RedocStandalone
            specUrl={API_ENDPOINT + "/swagger/v1.0/swagger.json"}
            options={{
                nativeScrollbars: true,
                theme: {
                    spacing: {
                        unit: 4,
                        // sectionHorizontal: 2,
                        sectionVertical: 1
                    },
                    colors: {
                        tonalOffset: 1,
                        primary: { main: '#b89e14' },
                        success: { main: '#b89e14' },
                        warning: { main: '#b89e14' },
                        error: { main: '#b89e14' },
                        border: { light: 'red', dark: 'blue' },
                        text: { primary: 'white', secondary: 'white' },
                        gray: { "50": 'green', "100": 'yellow' },
                        http: {
                            // get:'red'
                        },
                        responses: {
                            success: {
                                color: 'white',
                                backgroundColor: 'green',
                                tabTextColor: 'green'
                            }
                        }

                    },
                    typography: {
                        links: { color: 'white', visited: 'white', hover: 'wheat' },
                        fontFamily: 'Roboto Condensed',
                        headings: {
                            fontFamily: 'Roboto Mono',
                        },
                        code: {
                            color: 'green',
                            backgroundColor: 'black'
                        }
                    },
                    schema: {
                        linesColor: '#b89e14',
                        typeNameColor: '#b89e14',
                        typeTitleColor: '#b89e14',
                        requireLabelColor: '#b89e14',
                        nestedBackground: "black",
                        arrow: { color: 'red' }
                    },

                    sidebar: {
                        backgroundColor: 'rgb(9, 9, 11)',
                        textColor: 'rgba(255,255,255,1)',
                        activeTextColor: '#b89e14'
                    },
                    rightPanel: {
                        backgroundColor: 'rgb(9, 9, 11)'
                    },
                    codeBlock: { backgroundColor: 'black' },

                },

                hideDownloadButton: true,
                menuToggle: false,
                hideSchemaPattern: true,
                hideSchemaTitles: true
            }}
        />
    </>
    );
}