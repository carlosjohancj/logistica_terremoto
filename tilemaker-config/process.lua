node_keys = { "place", "population", "name" }
way_keys = { "highway", "name", "waterway", "natural", "landuse", "boundary", "admin_level", "type" }
relation_keys = { "boundary", "admin_level", "type", "name" }

function node_function(node)
  local place = Find("place")
  if place == "city" or place == "town" or place == "village" then
    local pop = tonumber(Find("population")) or 0
    Layer("places", false)
    Attribute("name", Find("name") or "")
    Attribute("population", pop)
    Attribute("place", place)
  end
end

function way_function(way)
  local highway = Find("highway")
  if highway == "motorway" or highway == "trunk" or highway == "primary" or highway == "secondary" or highway == "tertiary" then
    Layer("transportation", false)
    Attribute("class", highway)
    Attribute("name", Find("name") or "")
  end

  local natural = Find("natural")
  if natural == "water" then
    Layer("water", false)
  end

  local landuse = Find("landuse")
  if landuse == "reservoir" or landuse == "basin" then
    Layer("water", false)
  end

  local waterway = Find("waterway")
  if waterway == "riverbank" or waterway == "dock" then
    Layer("water", false)
  end

  local boundary = Find("boundary")
  if boundary == "administrative" then
    local admin_level = Find("admin_level")
    if admin_level == "2" or admin_level == "4" or admin_level == "6" then
      Layer("boundaries", false)
      Attribute("admin_level", admin_level)
      Attribute("name", Find("name") or "")
    end
  end
end

function relation_function(relation)
  local boundary = Find("boundary")
  if boundary == "administrative" then
    local admin_level = Find("admin_level")
    if admin_level == "2" or admin_level == "4" or admin_level == "6" then
      Layer("boundaries", false)
      Attribute("admin_level", admin_level)
      Attribute("name", Find("name") or "")
    end
  end
end
