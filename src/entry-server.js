import React from 'react';
import { renderToString } from 'react-dom/server';
import { match, RouterContext, createMemoryHistory } from 'react-router';
import Helmet from 'react-helmet';
import pify from 'pify';
import { buildRoutes } from './App';
import renderDocument from './index.html';

const matchAsync = pify(match, { multiArgs: true });

// Build our routes
const routes = buildRoutes();

export async function render({ req, res, buildManifest }) {
    // Match req against our routes
    const history = createMemoryHistory();
    const [redirectLocation, renderProps] = await matchAsync({ history, routes, location: req.url });

    // Is it to redirect?
    if (redirectLocation) {
        return res.redirect(redirectLocation.pathname + redirectLocation.search);
    }
    // 404? This shouldn't happen because we have a react-router catch all route, but just in case..
    if (!renderProps) {
        return res.status(404).end();
    }

    const serverContext = { req, res };

    // Render HTML that goes to into <div id="root"></div>
    const rootHtml = renderToString(
        <RouterContext
            { ...renderProps }
            createElement={ (Component, props) => <Component { ...props } serverContext={ serverContext } /> } />
    );

    // Render document
    const html = renderDocument({
        head: Helmet.rewind(),
        rootHtml,
        buildManifest,
    });

    // Send HTML
    res.send(html);
}

export async function renderError({ err, req, res, buildManifest }) {
    // Match req against our routes
    const history = createMemoryHistory();
    const [redirectLocation, renderProps] = await matchAsync({ history, routes, location: '/internal-error' });

    // Is it to redirect?
    if (redirectLocation) {
        return res.redirect(redirectLocation.pathname + redirectLocation.search);
    }
    // If there's no error page, render a generic one
    if (!renderProps) {
        throw err;
    }

    const serverContext = { req, res, err };

    // Render page that goes to into <div id="root"></div>
    const rootHtml = renderToString(
        <RouterContext
            { ...renderProps }
            createElement={ (Component, props) => <Component { ...props } serverContext={ serverContext } /> } />
    );

    // Render document
    const html = renderDocument({
        head: Helmet.rewind(),
        rootHtml,
        buildManifest,
    });

    // Send HTML
    res.send(html);
}
