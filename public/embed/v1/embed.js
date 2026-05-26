(function () {
  "use strict";
  var script = document.currentScript;
  if (!script) return;
  var token = script.getAttribute("data-widget");
  var targetId = script.getAttribute("data-target");
  if (!token || !targetId) return;
  var el = document.getElementById(targetId);
  if (!el) return;
  if (el.querySelector("iframe")) return;

  var src = script.src || "";
  var origin = src.replace(/\/embed\/v1\/embed\.js.*$/, "");
  var height = script.getAttribute("data-height");

  el.style.display = "block";
  el.style.width = "100%";
  el.style.position = "relative";
  el.style.overflow = "hidden";
  el.style.boxSizing = "border-box";

  if (height) {
    el.style.height = height;
    el.style.minHeight = height;
  } else {
    el.style.height = "100%";
    el.style.minHeight = "100%";
  }

  /** Flex/CMS shells (e.g. Elementor) size the widget box but not height:100% on children. */
  function findHost() {
    return (
      el.closest(".elementor-element") ||
      el.closest(".elementor-widget-container") ||
      el.parentElement
    );
  }

  function syncHeightFromHost() {
    if (height) return;
    var host = findHost();
    if (!host) return;
    var h = host.getBoundingClientRect().height;
    if (h > 0) {
      var px = Math.round(h) + "px";
      el.style.height = px;
      el.style.minHeight = px;
    }
  }

  syncHeightFromHost();

  if (!height && typeof ResizeObserver !== "undefined") {
    var host = findHost();
    if (host) {
      var ro = new ResizeObserver(syncHeightFromHost);
      ro.observe(host);
      window.addEventListener("resize", syncHeightFromHost);
    }
  }

  var iframe = document.createElement("iframe");
  iframe.src = origin + "/embed/" + encodeURIComponent(token);
  iframe.title = "Social media widget";
  iframe.loading = "lazy";
  iframe.setAttribute("allow", "fullscreen");
  iframe.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;border:0;display:block;";
  el.appendChild(iframe);

  iframe.addEventListener("load", syncHeightFromHost);
})();
