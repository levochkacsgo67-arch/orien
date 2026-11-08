if (window.top !== window.self) { try { window.top.location = window.self.location; } catch (e) { document.documentElement.style.display = "none"; } }
var seen = false; try { seen = !!localStorage.getItem("orien-intro"); } catch (e) {}
document.documentElement.classList.add(seen ? "seen" : "ld");
