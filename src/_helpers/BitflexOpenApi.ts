import { AdminApi, ApplicationApi, BalanceApi, GatewayApi, GuardApi, MarketsApi, NotificationsApi, OrdersApi, P2PApi, SignApi, StaticPagesApi, TradingViewApi, UserApi } from '../api-wrapper/api';
import axios, { AxiosInstance } from 'axios';

import { Configuration } from '../api-wrapper/configuration';
import SecureLS from 'secure-ls';
import { authToken } from './auth-header';
import useUserState from '../hooks/useUserState';

export class BitflexOpenApi {



    private static config: Configuration;

    public static AdminApi: AdminApi;
    public static BalanceApi: BalanceApi;
    public static SignApi: SignApi;
    public static MarketsApi: MarketsApi;
    public static OrdersApi: OrdersApi;
    public static StaticPagesApi: StaticPagesApi;
    public static ApplicationApi: ApplicationApi;
    public static UserApi: UserApi;
    public static NotificationsApi: NotificationsApi;

    public static GuardApi: GuardApi;
    public static P2PApi: P2PApi;

    public static GatewayApi: GatewayApi;
    public static TradingViewApi: TradingViewApi;

    public static Init(token?: string) {



        const axiosInstance = axios.create();


        axiosInstance.interceptors.response.use(function (response) {
            // Any status code that lie within the range of 2xx cause this function to trigger
            // Do something with response data
            return response;
        }, function (error) {
            // Any status codes that falls outside the range of 2xx cause this function to trigger
            // Do something with response error
            if (error && error.response && error.response.status === 401) {

                localStorage.clear()
                sessionStorage.clear();

                var ls = new SecureLS({ encodingType: 'rc4', isCompression: false });
                ls.clear();
                window.location.href = "/terminal"

                alert("Session Expired or Terminated")

            }
            return Promise.reject(error);
        });


        if (token)
            BitflexOpenApi.config = new Configuration({ accessToken: token })
        else
            BitflexOpenApi.config = new Configuration({ accessToken: authToken() })

        BitflexOpenApi.AdminApi = new AdminApi(BitflexOpenApi.config, process.env.NODE_ENV === "production" ? "https://api.bcflex.com" : "http://127.0.0.1:5000", axiosInstance);
        BitflexOpenApi.BalanceApi = new BalanceApi(BitflexOpenApi.config, process.env.NODE_ENV === "production" ? "https://api.bcflex.com" : "http://127.0.0.1:5000", axiosInstance);
        BitflexOpenApi.SignApi = new SignApi(BitflexOpenApi.config, process.env.NODE_ENV === "production" ? "https://api.bcflex.com" : "http://127.0.0.1:5000", axiosInstance);
        BitflexOpenApi.MarketsApi = new MarketsApi(BitflexOpenApi.config, process.env.NODE_ENV === "production" ? "https://api.bcflex.com" : "http://127.0.0.1:5000", axiosInstance);
        BitflexOpenApi.OrdersApi = new OrdersApi(BitflexOpenApi.config, process.env.NODE_ENV === "production" ? "https://api.bcflex.com" : "http://127.0.0.1:5000", axiosInstance);
        BitflexOpenApi.StaticPagesApi = new StaticPagesApi(BitflexOpenApi.config, process.env.NODE_ENV === "production" ? "https://api.bcflex.com" : "http://127.0.0.1:5000", axiosInstance);
        BitflexOpenApi.ApplicationApi = new ApplicationApi(BitflexOpenApi.config, process.env.NODE_ENV === "production" ? "https://api.bcflex.com" : "http://127.0.0.1:5000", axiosInstance);
        BitflexOpenApi.UserApi = new UserApi(BitflexOpenApi.config, process.env.NODE_ENV === "production" ? "https://api.bcflex.com" : "http://127.0.0.1:5000", axiosInstance);

        BitflexOpenApi.P2PApi = new P2PApi(BitflexOpenApi.config, process.env.NODE_ENV === "production" ? "https://api.bcflex.com" : "http://127.0.0.1:5000", axiosInstance);

        BitflexOpenApi.GuardApi = new GuardApi(BitflexOpenApi.config, process.env.NODE_ENV === "production" ? "https://api.bcflex.com" : "http://127.0.0.1:5000", axiosInstance);
        BitflexOpenApi.NotificationsApi = new NotificationsApi(BitflexOpenApi.config, process.env.NODE_ENV === "production" ? "https://api.bcflex.com" : "http://127.0.0.1:5000", axiosInstance);

        BitflexOpenApi.GatewayApi = new GatewayApi(BitflexOpenApi.config, process.env.NODE_ENV === "production" ? "https://api.bcflex.com" : "http://127.0.0.1:5000", axiosInstance);

        BitflexOpenApi.TradingViewApi = new TradingViewApi(BitflexOpenApi.config, process.env.NODE_ENV === "production" ? "https://api.bcflex.com" : "http://127.0.0.1:5000", axiosInstance);

        
        
    }
}