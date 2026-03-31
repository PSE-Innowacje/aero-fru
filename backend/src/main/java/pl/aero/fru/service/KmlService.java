package pl.aero.fru.service;

import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;
import pl.aero.fru.exception.BusinessRuleException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class KmlService {

    private static final int MAX_POINTS = 5000;
    private static final double EARTH_RADIUS_KM = 6371.0;

    public int calculateRouteKm(byte[] kmlData) {
        List<double[]> coordinates = parseCoordinates(kmlData);
        if (coordinates.isEmpty()) {
            throw new BusinessRuleException("KML file contains no coordinates");
        }
        if (coordinates.size() > MAX_POINTS) {
            throw new BusinessRuleException("KML file exceeds maximum of " + MAX_POINTS + " points");
        }

        double totalDistance = 0.0;
        for (int i = 1; i < coordinates.size(); i++) {
            totalDistance += haversine(
                    coordinates.get(i - 1)[1], coordinates.get(i - 1)[0],
                    coordinates.get(i)[1], coordinates.get(i)[0]);
        }

        return (int) Math.round(totalDistance);
    }

    private List<double[]> parseCoordinates(byte[] kmlData) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(false);
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new ByteArrayInputStream(kmlData));

            NodeList coordNodes = doc.getElementsByTagName("coordinates");
            List<double[]> allCoordinates = new ArrayList<>();

            for (int i = 0; i < coordNodes.getLength(); i++) {
                String text = coordNodes.item(i).getTextContent().trim();
                String[] tuples = text.split("\\s+");
                for (String tuple : tuples) {
                    String trimmed = tuple.trim();
                    if (trimmed.isEmpty()) continue;
                    String[] parts = trimmed.split(",");
                    if (parts.length >= 2) {
                        double lon = Double.parseDouble(parts[0]);
                        double lat = Double.parseDouble(parts[1]);
                        allCoordinates.add(new double[]{lon, lat});
                    }
                }
            }

            return allCoordinates;
        } catch (BusinessRuleException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessRuleException("Invalid KML file: " + e.getMessage());
        }
    }

    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }
}
