using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace API.Controllers
{
    public class FallbackController : Controller
    {
        public IActionResult Index()
        {
            var www = Directory.GetCurrentDirectory();  // …\backend\API
            var path = Path.Combine(www, "wwwroot", "browser", "index.html");
            return PhysicalFile(path, "text/html");
        }
    }
}
