namespace API.Errors
{
    public class ApiException : ApiResponse
    {
        public ApiException(int statusCode, string message = null, string deatils = null) : base(statusCode, message)
        {
            Details = deatils;
        }

        public string Details { get; set; }
    }
}
