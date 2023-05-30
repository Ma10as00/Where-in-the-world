package main.java;

public class Position {
    private String type = "Feature";
    private Geometry  geo;
    private Property prop;

    public Position(float latitude, float longitude, String name){
        geo = new Geometry(latitude, longitude);
        prop = new Property(name);
    }

    @Override
    public String toString() {
        return prop.name + "   " + geo.coordinates.toString();
    }
}
