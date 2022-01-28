import axios from "axios";

const useHttp = () => {
  const endpointserver = "http://localhost:1337/";

  const get = async (url: string): Promise<any> => {
    try {
      let req = await axios.get(`${endpointserver}${url}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      return req.data;
    } catch (error) {
      throw Error(error as any);
    }
  };

  const getAfterLogin = async (url: string, auth: string): Promise<any> => {
    try {
      let req = await axios.get(`${endpointserver}${url}`, {
        headers: {
          Authorization: `Bearer ${auth}`,
        },
      });

      return req.data;
    } catch (error) {
      throw Error(error as any);
    }
  };

  const post = async (url: string, body: object): Promise<any> => {
    try {
      let req = await axios.post(`${endpointserver}${url}`, body, {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      return req.data;
    } catch (error) {
      throw Error(error as any);
    }
  };

  const update = async (url: string, body: object): Promise<any> => {
    try {
      let req = await axios.put(`${endpointserver}${url}`, body, {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      return req.data;
    } catch (error) {
      throw Error(error as any);
    }
  };

  const deleted = async (url: string): Promise<any> => {
    try {
      let req = await axios.delete(`${endpointserver}${url}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      return req.data;
    } catch (error) {
      throw Error(error as any);
    }
  };

  const login = async (url: string, body: object): Promise<any> => {
    try {
      let req = await axios.post(`${endpointserver}${url}`, body, {
        headers: {
          "Content-type": "application/json",
        },
      });

      return req.data;
    } catch (error) {
      throw Error(error as any);
    }
  };

  return {
    get,
    getAfterLogin,
    post,
    update,
    deleted,
    login,
  };
};

export default useHttp;
