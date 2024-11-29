class AxiosService {
  constructor(baseURL) {
    this.axiosInstance = axios.create({
      baseURL: baseURL || "http://127.0.0.1:5000", // URL mặc định
      headers: {
        "Content-Type": "application/json", // Header mặc định cho JSON
      },
    });
  }

  /**
   * Hàm xử lý GET request
   * @param {string} url - API endpoint
   * @param {object} params - Query parameters (nếu có)
   * @returns {Promise} - Dữ liệu từ API
   */
  async get(url, params = {}) {
    try {
      const response = await this.axiosInstance.get(url, { params });
      return response.data; // Trả về dữ liệu từ response
    } catch (error) {
      console.error("Error in GET request:", error);
      throw new Error(error.response?.data?.message || "GET request failed");
    }
  }

  /**
   * Hàm xử lý POST request
   * @param {string} url - API endpoint
   * @param {object} data - Body của request
   * @param {object} params - Query parameters (nếu có)
   * @returns {Promise} - Dữ liệu từ API
   */
  async post(url, data = {}, params = {}) {
    try {
      const response = await this.axiosInstance.post(url, data, { params });
      return response.data;
    } catch (error) {
      console.error("Error in POST request:", error);
      throw new Error(error.response?.data?.message || "POST request failed");
    }
  }

  /**
   * Hàm xử lý PUT request
   * @param {string} url - API endpoint
   * @param {object} data - Body của request
   * @returns {Promise} - Dữ liệu từ API
   */
  async put(url, data) {
    try {
      const response = await this.axiosInstance.put(url, data);
      return response.data;
    } catch (error) {
      console.error("Error in PUT request:", error);
      throw new Error(error.response?.data?.message || "PUT request failed");
    }
  }

  /**
   * Hàm xử lý DELETE request
   * @param {string} url - API endpoint
   * @returns {Promise} - Dữ liệu từ API
   */
  async delete(url) {
    try {
      const response = await this.axiosInstance.delete(url);
      return response.data;
    } catch (error) {
      console.error("Error in DELETE request:", error);
      throw new Error(error.response?.data?.message || "DELETE request failed");
    }
  }

  /**
   * Hàm upload file
   * @param {string} url - API endpoint
   * @param {FormData} formData - Dữ liệu file
   * @param {object} params - Query parameters (nếu có)
   * @returns {Promise} - Dữ liệu từ API
   */
  async postWithFile(url, formData, params = {}) {
    try {
      const response = await this.axiosInstance.post(url, formData, {
        params,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("File uploaded successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error(
        error.response?.data?.message || "File upload request failed"
      );
    }
  }
}
