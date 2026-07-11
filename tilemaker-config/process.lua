node_keys = { "place", "population", "name" }
way_keys = { "highway", "name", "waterway", "natural", "landuse", "boundary", "admin_level", "type" }
relation_keys = { "boundary", "admin_level", "type", "name" }

function node_function(node)
  local place = node:Find("place")
  if place == "city" or place == "town" or place == "village" then
    local pop = tonumber(node:Find("population")) or 0
    node:Layer("places", false)
    node:Attribute("name", node:Find("name") or "")
    node:Attribute("population", pop)
    node:Attribute("place", place)
  end
end

function way_function(way)
  local highway = way:Find("highway")
  if highway == "motorway" or highway == "trunk" or highway == "primary" or highway == "secondary" or highway == "tertiary" then
    way:Layer("transportation", false)
    way:Attribute("class", highway)
    way:Attribute("name", way:Find("name") or "")
  end

  local natural = way:Find("natural")
  if natural == "water" then
    way:Layer("water", false)
  end

  local landuse = way:Find("landuse")
  if landuse == "reservoir" or landuse == "basin" then
    way:Layer("water", false)
  end

  local waterway = way:Find("waterway")
  if waterway == "riverbank" or waterway == "dock" then
    way:Layer("water", false)
  end

  local boundary = way:Find("boundary")
  if boundary == "administrative" then
    local admin_level = way:Find("admin_level")
    if admin_level == "2" or admin_level == "4" or admin_level == "6" then
      way:Layer("boundaries", false)
      way:Attribute("admin_level", admin_level)
      way:Attribute("name", way:Find("name") or "")
    end
  end
end

function relation_function(relation)
  local boundary = relation:Find("boundary")
  if boundary == "administrative" then
    local admin_level = relation:Find("admin_level")
    if admin_level == "2" or admin_level == "4" or admin_level == "6" then
      relation:Layer("boundaries", false)
      relation:Attribute("admin_level", admin_level)
      relation:Attribute("name", relation:Find("name") or "")
    end
  end
end
