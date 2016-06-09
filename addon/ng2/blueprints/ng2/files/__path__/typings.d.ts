/// <reference path="<%= refToTypings %>/typings/browser.d.ts" />
<% if(!isMobile && !universal) { %>declare var module: { id: string };<% } %>
