// The below was provided by the reference tutorial under the Creative Commons License

module.exports = function follow(api, rootPath, relArray, token) {
    var root = api({
        method: 'GET',
        path: rootPath,
        headers: {'Authorization':'Bearer ' + token}
    });

    return relArray.reduce(function(root, arrayItem) {
        var rel = typeof arrayItem === 'string' ? arrayItem : arrayItem.rel;
        return traverseNext(root, rel, arrayItem, token);
    }, root);

    function traverseNext (root, rel, arrayItem, token) {
        return root.then(function (response) {
            if (hasEmbeddedRel(response.entity, rel)) {
                return response.entity._embedded[rel];
            }

            if(!response.entity._links) {
                return [];
            }

            if (typeof arrayItem === 'string') {
                return api({
                    method: 'GET',
                    path: response.entity._links[rel].href,
                    headers: {'Authorization':'Bearer ' + token}

                });
            } else {
                return api({
                    method: 'GET',
                    path: response.entity._links[rel].href,
                    params: arrayItem.params,
                    headers: {'Authorization':'Bearer ' + token}
                });
            }
        });
    }

    function hasEmbeddedRel (entity, rel) {
        return entity._embedded && entity._embedded.hasOwnProperty(rel);
    }
};
