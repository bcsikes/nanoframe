require 'json'

class Graph
    attr_accessor :vertices, :edges, :sets, :route, :planes
    
    # dimension[0] -> width
    # dimension[1] -> height
    # dimension[2] -> depth
    def initialize(dimensions, segments, scaff_length)
        @width = dimensions[0] 
        @height = dimensions[1]
        @depth = dimensions[2]       
        @segments = segments.to_i
        @scaff_length = scaff_length
        v_and_e = create_vertices_and_edges
        @vertices = v_and_e[0]
        @edges = v_and_e[1]
        if @segments == 2
            @template_planes = [find_step_plane_routing, find_reverse_step_plane_routing]
        else
            @template_planes = find_four_planes
        end
        
        # @planes = @template_planes 
        (@planes, @raw_planes) = find_plane_combination(@template_planes) 
    end

    def create_vertices_and_edges
        v = []
        e = []
        x = 0
        y = 0
        
        while (x <= @segments && y <= @segments)

            if !(x % @segments == 0 && y % @segments == 0)
                v.push(Vertex.new(x, y))
                if (x == 0)
                    e << Edge.new(Vertex.new(x, y), Vertex.new(x + 1, y))
                elsif (y == 0)
                    e << Edge.new(Vertex.new(x, y), Vertex.new(x, y + 1))
                elsif (x != @segments && y != @segments )
                    e << Edge.new(Vertex.new(x, y), Vertex.new(x + 1, y))
                    e << Edge.new(Vertex.new(x, y), Vertex.new(x, y + 1))
                end
            end
            y += 1
            
            if (y > @segments)
                y = 0
                x += 1
            end
            
        end
        [v, e]
    end

    def find_outgoers
        v_set = []
        @vertices.each do |v|
            if (v.x % @segments == 0) || (v.y % @segments == 0)
                v_set.append(v)
            end
        end
        v_set
    end

    def is_contained?(o, sets)
        sets.each do |s|
            if ((o.x == s.v.first.x && o.y == s.v.first.y && o.z == s.v.first.z) ||
                 (o.x == s.v.last.x && o.y == s.v.last.y && o.z == s.v.last.z))
                return true
            end
        end
        false 
    end

    def find_vertex(vs, x, y, z)
        vs.each do |v|
            if (v.x == x && v.y == y && v.z = z)
                return v
            end
        end
        nil
    end


    def find_step_plane_routing
        outgoers = find_outgoers
        plane_sets = []

        outgoers.each do |vertex|
            if is_contained?(vertex, plane_sets)
                next
            end

            i = 0
            outgoer_set = Set.new(vertex)
            curr = vertex
            while outgoer_set.v.length != 2
                
                next_vertex = nil
                if vertex.x == 0
                    if i % 2 == 0
                        # make right
                        next_vertex = find_vertex(@vertices, curr.x + 1, curr.y, curr.z)
                    else 
                        # make down
                        next_vertex = find_vertex(@vertices, curr.x, curr.y - 1, curr.z)
                    end
                    edge = Edge.new(curr, next_vertex)
                    curr = next_vertex
                    outgoer_set.add_edge(edge)
                    i += 1
                elsif vertex.y == @segments
                    if i % 2 == 0
                        # make down
                        next_vertex = find_vertex(@vertices, curr.x, curr.y - 1, curr.z)
                    else 
                        # make right
                        next_vertex = find_vertex(@vertices, curr.x + 1, curr.y, curr.z)
                    end
                    edge = Edge.new(curr, next_vertex)
                    curr = next_vertex
                    outgoer_set.add_edge(edge)
                    i += 1
                else
                    next
                end

                if outgoers.include? next_vertex
                    outgoer_set.add_node(next_vertex)
                end
            end
            plane_sets.append(outgoer_set)
        end
        plane_sets
    end

    def find_reverse_step_plane_routing
        outgoers = find_outgoers
        plane_sets = []

        outgoers.each do |vertex|
            if is_contained?(vertex, plane_sets)
                next
            end

            i = 0
            outgoer_set = Set.new(vertex)
            curr = vertex
            while outgoer_set.v.length != 2
                
                next_vertex = nil
                if vertex.x == 0
                    if i % 2 == 0
                        # make right
                        next_vertex = find_vertex(@vertices, curr.x + 1, curr.y, curr.z)
                    else 
                        # make up
                        next_vertex = find_vertex(@vertices, curr.x, curr.y + 1, curr.z)
                    end
                    edge = Edge.new(curr, next_vertex)
                    curr = next_vertex
                    outgoer_set.add_edge(edge)
                    i += 1
                elsif vertex.y == 0
                    if i % 2 == 0
                        # make up
                        next_vertex = find_vertex(@vertices, curr.x, curr.y + 1, curr.z)
                    else 
                        # make right
                        next_vertex = find_vertex(@vertices, curr.x + 1, curr.y, curr.z)
                    end
                    edge = Edge.new(curr, next_vertex)
                    curr = next_vertex
                    outgoer_set.add_edge(edge)
                    i += 1
                else
                    next
                end

                if outgoers.include? next_vertex
                    outgoer_set.add_node(next_vertex)
                end
            end
            plane_sets.append(outgoer_set)
        end
        plane_sets
    end

    # randomized algorithm that finds general plane routings
    # by selecting random start and end vertices
    def find_general_plane_routing
        outgoers = find_outgoers
        total_outgoers = outgoers.length
        taken_outgoers = []
        taken_edges = []
        sets = []
        while taken_outgoers.length != total_outgoers
            s = outgoers[rand(0..(outgoers.length - 1))]
            outgoers.delete(s)
            t = outgoers[rand(0..(outgoers.length - 1))]
            dfs_edges = dfs(s, t, taken_edges)
            # first element of dfs_results tells whether s->t is
            # accessible and the second return the list of edges
            if dfs_edges != []
                outgoers.delete(t)
                taken_outgoers << s
                taken_outgoers << t
                taken_edges.concat(dfs_edges)
                # generate a new set
                new_set = Set.new(s)
                new_set.add_node(t)
                dfs_edges.each do |e|
                    new_set.add_edge(e)
                end
                sets << new_set
            else
                outgoers << s
            end
        end
        if taken_edges.length != @edges.length
            return find_general_plane_routing
        else
            return sets
        end
    end

    # performs depth first search starting from s and find a 
    # path to t if one is available, returns list of edges or []
    def dfs(k, t, taken_edges)
        visited = {}
        edges = deep_copy_edges(taken_edges)
        # 0 denotes horizontal movement and 1 vertical
        prev = k.x % @segments == 0 ? 0 : 1 
        
        @vertices.each do |v|
            visited[v.hash] = [] # empty array of edges
        end
        visited = explore(k, t, prev, edges, visited)
        visited[t.hash]

    end

    def explore(k, t, prev, edges, visited)
        neighbors = find_neighbors(k, prev, edges)
        if neighbors.length == 0
            return []
        end
        neighbors.each do |neighbor|
            new_edge = Edge.new(k, neighbor)
            edges = find_and_remove_edge(edges, new_edge)

            if visited[neighbor.hash] == []
                visited[neighbor.hash] << new_edge
                visited[k.hash].each do |p|
                    visited[neighbor.hash] << p
                end
            end
            explore(neighbor, t, (prev - 1).abs(), edges, visited)
        end
        visited
    end

    def deep_copy_edges(taken_edges)
        edges = []
        @edges.each do |e|
            if !is_taken_edge?(e, taken_edges)
                edges << Edge.new(e.v1, e.v2)
            end
        end
        edges
    end

    def is_taken_edge?(e, taken_edges)
        taken_edges.each do |tk|
            if (equals_vertex(tk.v1, e.v1) && equals_vertex(tk.v2, e.v2)) ||
                (equals_vertex(tk.v2, e.v1) && equals_vertex(tk.v1, e.v2))
                return true
            end
        end
        false
    end

    def find_and_remove_edge(edges, e)
        for i in (0...edges.length)
            if (equals_vertex(edges[i].v1, e.v1) && equals_vertex(edges[i].v2, e.v2)) ||
                (equals_vertex(edges[i].v2, e.v1) && equals_vertex(edges[i].v1, e.v2))
                edges.delete_at(i)
                break
            end
        end
        edges
    end

    def find_neighbors(v, prev, edges)
        n = []
        edges.each do |e|
            if equals_vertex(v, e.v1)
                if prev == 1 && (e.v2.y - v.y).abs() == 1 
                    n << e.v2
                elsif prev == 0 && (e.v2.x - v.x).abs() == 1
                    n << e.v2
                end
            elsif equals_vertex(v, e.v2)
                if prev == 1 && (e.v1.y - v.y).abs() == 1 
                    n << e.v1
                elsif prev == 0 && (e.v1.x - v.x).abs() == 1
                    n << e.v1
                end
            end
        end
        n
    end
    
    # Generates plane routings for other faces of the cube
    # back -> 0
    # top -> 1
    # bottom -> 2
    # left -> 3
    # right -> 4
    def transform(plane)
        plane_arr = [plane]
        #back - subtract z=dimension from all vertices
        back = deep_clone_and_transform_plane(plane, 0)
        plane_arr.append(back)

        top = deep_clone_and_transform_plane(plane, 1)
        plane_arr.append(top)

        bottom = deep_clone_and_transform_plane(plane, 2)
        plane_arr.append(back)

        left = deep_clone_and_transform_plane(plane, 3)
        plane_arr.append(left)

        right = deep_clone_and_transform_plane(plane, 4)
        plane_arr.append(right)
        plane_arr
    end
    
    def transform_arr(arr)
        new_arr = arr[1..arr.length-1]
        i = 1
        while i < arr.length
            arr[i] = deep_clone_and_transform_plane(arr[i], i - 1)
            i += 1
        end
        arr
    end

    def reverse_transform_arr(arr)
        new_arr = [arr[0]]
        i = 1
        while i < arr.length
            new_arr[i] = reverse_deep_clone_and_transform_plane(arr[i], i - 1)
            i += 1
        end
        new_arr
    end
    #top - swap y and z and set y = dimension 
    #bottom - swap y and z and set y = 0
    #right - swap x and z and set x = dimension
    #left - swap x and z and set x = 0
    def deep_clone_and_transform_plane(obj, num)
        res = []
        edges_covered = []
        obj.each do |set|
            v_arr = []
            set.v.each do |v|
                case num
                when 0
                    v_arr.append(Vertex.new(v.x, v.y, v.z - @segments))
                when 1
                    v_arr.append(Vertex.new(v.x, v.z + @segments, -v.y))
                when 2
                    v_arr.append(Vertex.new(v.x, v.z, -v.y))
                when 3
                    v_arr.append(Vertex.new(v.z + @segments, v.y, -v.x))
                else 
                    v_arr.append(Vertex.new(v.z, v.y, -v.x))
                end
            end
            new_set = Set.new(v_arr.first)
            new_set.add_node(v_arr.last)
            
            
            set.e.each do |e|
                case num
                when 0
                    v1 = Vertex.new(e.v1.x, e.v1.y, e.v1.z - @segments)
                    v2 = Vertex.new(e.v2.x, e.v2.y, e.v2.z - @segments)
                when 1
                    v1 = Vertex.new(e.v1.x, e.v1.z + @segments, -e.v1.y)
                    v2 = Vertex.new(e.v2.x, e.v2.z + @segments, -e.v2.y)
                when 2
                    v1 = Vertex.new(e.v1.x, e.v1.z, -e.v1.y)
                    v2 = Vertex.new(e.v2.x, e.v2.z, -e.v2.y)
                when 3
                    v1 = Vertex.new(e.v1.z + @segments, e.v1.y, -e.v1.x)
                    v2 = Vertex.new(e.v2.z + @segments, e.v2.y, -e.v2.x)
                else
                    v1 = Vertex.new(e.v1.z, e.v1.y, -e.v1.x)
                    v2 = Vertex.new(e.v2.z, e.v2.y, -e.v2.x)
                end
                new_edge = Edge.new(v1, v2)
                new_set.add_edge(new_edge)        
            end
            res.append(new_set)
        end
        res
    end

    def reverse_deep_clone_and_transform_plane(obj, num)
        res = []
        edges_covered = []
        obj.each do |set|
            v_arr = []
            set.v.each do |v|
                case num
                when 0
                    recover_x = v.x
                    recover_y = v.y
                    recover_z = v.z + @segments
                    v_arr.append(Vertex.new(recover_x, recover_y, recover_z))
                when 1
                    recover_x = v.x
                    recover_y = -v.z
                    recover_z = v.y - @segments
                    v_arr.append(Vertex.new(recover_x, recover_y, recover_z))
                when 2
                    recover_x = v.x
                    recover_y = -v.z
                    recover_z = v.y
                    v_arr.append(Vertex.new(recover_x, recover_y, recover_z))
                when 3
                    recover_x = -v.z
                    recover_y = v.y
                    recover_z = v.x - @segments
                    v_arr.append(Vertex.new(recover_x, recover_y, recover_z))
                else 
                    recover_x = -v.z
                    recover_y = v.y
                    recover_z = v.x
                    v_arr.append(Vertex.new(recover_x, recover_y, recover_z))
                end
            end
            new_set = Set.new(v_arr.first)
            new_set.add_node(v_arr.last)
            
            
            set.e.each do |e|
                case num
                when 0
                    v1 = Vertex.new(e.v1.x, e.v1.y, e.v1.z + @segments)
                    v2 = Vertex.new(e.v2.x, e.v2.y, e.v2.z + @segments)
                when 1
                    v1 = Vertex.new(e.v1.x, -e.v1.z, e.v1.y - @segments)
                    v2 = Vertex.new(e.v2.x, -e.v2.z, e.v2.y - @segments)
                when 2
                    v1 = Vertex.new(e.v1.x, -e.v1.z, e.v1.y)
                    v2 = Vertex.new(e.v2.x, -e.v2.z, e.v2.y)
                when 3
                    v1 = Vertex.new(-e.v1.z, e.v1.y, e.v1.x - @segments)
                    v2 = Vertex.new(-e.v2.z, e.v2.y, e.v2.x - @segments)
                else
                    v1 = Vertex.new(-e.v1.z, e.v1.y, e.v1.x)
                    v2 = Vertex.new(-e.v2.z, e.v2.y, e.v2.x)
                end
                new_edge = Edge.new(v1, v2)
                new_set.add_edge(new_edge)        
            end
            res.append(new_set)
        end
        res
    end

    # find 4 unique plane routings
    def find_four_planes
        planes = []
        # new_plane = nil
        # while new_plane == nil
        #     new_plane = find_general_plane_routing
        # end
        while planes.length != 4
            new_plane = find_general_plane_routing
            if !includes_plane?(new_plane, planes)
                planes << new_plane
            end
        end
        planes
    end

    def includes_plane?(new_plane, plane)
        false
    end

    def find_plane_combination(planes)
        i = 0
        found = false
        combinations = planes.product(planes, planes, planes, planes, planes)
        combinations.each do |c|
            
            arr = transform_arr(c)
            
            if has_one_loop(arr)
                found = true
                # byebug
                reverse_arr = reverse_transform_arr(arr)
                return [arr, reverse_arr]
            end
            i += 1
        end
        
        if !found
            return find_plane_combination(find_four_planes)
        end
        
    end

    def has_one_loop(g)
     
        all_sets = []
        g.each do |plane|
            plane.each do |set|
                all_sets.append(set)
            end
        end
        next_set = all_sets.first
        starting_vertex = next_set.v.first
        end_vertex = next_set.v.last
        all_sets.delete(next_set)
        while !equals_vertex(starting_vertex, end_vertex)
            # do stuff
           
            res = find_next_set(all_sets, end_vertex)
            next_set = res[0]
            end_vertex = res[1]
            all_sets.delete(next_set)
        end

        if all_sets.length != 0
            return false
        end
        true
    end

    def equals_vertex(v1, v2)
        v1.x == v2.x && v1.y == v2.y && v1.z == v2.z
    end

    # bug here
    def find_next_set(sets, end_vertex)
        
        sets.each do |s|
            start_v = s.v.first
            end_v = s.v.last 
            
            if (equals_vertex(start_v, end_vertex)) 
                return [s, end_v]    
            end

            if (equals_vertex(end_v, end_vertex))
                return [s, start_v]
            end
        end
       
    end

    def string_of_vertices
        res = "("
        @vertices.each do |v|
            
            res += v.string
            if !(v == @vertices.last)
                res += ", "
            end
        end
        res += ")"
    end

    def string_of_sets(sets)
        res = "("
        sets.each do |s|
            res += s.string
            if !(s == sets.last)
                res += ", "
            end
        end
        res += ")"
    end

    def string_of_edges
        ""
    end

    def make_vertex(x, y)
        Vertex.new(x, y)
    end

    def make_set(v, singelton=false)
        Set.new(v, singelton)
    end

    def make_edge(v1, v2)
        Edge.new(v1, v2)
    end

    # Generates JSON file of the graph
    def to_json
        if @planes == nil 
            return nil
        end
        plane_arr = []        
        @planes.each do |plane|
            p = Plane.new(plane)
            plane_arr.append(p.to_hash)
        end

        hash = {"width": @width, "height": @height, "depth": @depth, "segments": @segments, "scaffold_length": 7249, "planes": plane_arr}

        JSON.generate(hash)
    end

    def raw_to_json
        if @raw_planes == nil 
            return nil
        end
        raw_plane_arr = []        
        @raw_planes.each do |plane|
            p = Plane.new(plane)
            raw_plane_arr.append(p.to_hash)
        end

        hash = {"segments": @segments, "scaffold_length": 7249, "planes": raw_plane_arr}

        JSON.generate(hash)
    end

    def beautify_edges(edges=@edges)
        result = ""
        edges.each do |e|
            result += e.string + "\n"
        end
        result
    end

    def beautify_vertices(vertices=@vertices)
        result = ""
        vertices.each do |v|
            result += v.string + "\n"
        end
        result
    end

    # Vertex object corresponding to a position in a 3D grid
    class Vertex
        attr_accessor :x, :y, :z

        def initialize(x, y, z=0)
            @x = x
            @y = y
            @z = z
        end

        def string
            "(#{@x}, #{@y}, #{@z})"
        end

        def to_hash
            {"x": @x, "y": @y, "z": @z}
        end

        def to_json
            JSON.generate({"x": @x, "y": @y, "z": @z})
        end

        def hash
            "#{x}#{y}#{z}"
        end

    end

    # Set object corresponding to a list of Edges 
    class Set
        attr_accessor :v, :singelton, :e

        def initialize(vertex, singelton=false)
            @v = [vertex]
            @singelton = singelton
            @e = []
        end

        def add_node(vertex)
            @v.append(vertex)
        end

        def add_edge(edge)
            @e.append(edge)
        end

        def is_loop_set?
            @e.length == 2 
        end

        def string
            res = "{"
            @v.each do |v|
                res += v.string
                if v != @v.last
                    res += ", "
                end
            end
            res += "}"
        end

        def sort_edges
            last_vertex = @v.first
            sorted_edges = []
            while sorted_edges != @e.length
                e = find_edge_starting_with(last_vertex)
                sort_edges.append(e)
                last_vertex = e.v2
            end
            sort_edges
        end

        def find_edge_starting_with(v)
            @e.each do |edge|
                if edge.v1 == v
                    return edge
                end
            end
        end

        def to_hash
            hash = {"vertices": @v, "edges": sort_edges, "singelton": singelton}
        end

        def to_json
            JSON.generate(to_hash)
        end
        
    end

    # Edge object corresponding to a connection between two vertices
    class Edge

        attr_accessor :v1, :v2

        def initialize(v1, v2)
            @v1 = v1
            @v2 = v2
        end

        def string
            "#{v1.string} -> #{v2.string}"
        end

        def to_hash
            {"v1": @v1.to_hash, "v2": @v2.to_hash}
        end

        def to_json
            JSON.generate({"v1": @v1.to_hash, "v2": @v2.to_hash})
        end
    end
end