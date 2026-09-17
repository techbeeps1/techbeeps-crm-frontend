import React, { useContext, useEffect, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { EmailContext } from "../../../EmailProvider/EmailContext";
import axios from "axios";
import RelocationCalculation from "../InnerForm/RelocationCalculation";
import PackingCalculation from "../InnerForm/PackingCalculation";
import AssemblingCalculation from "../InnerForm/AssemblingCalculation";
import StorageCalculation from "../InnerForm/StorageCalculation";
import MaterialsCalculation from "../InnerForm/MaterialsCalculation";
import { formatCurrency } from "../../../utils/currencyUtil";


const PriceCalculation: React.FC<any> = ({ rooms, selectedServices, data }) => {
    const { setValue, watch } = useFormContext() as any;
    const { settings } = useContext(EmailContext) as any;
    const [totalSum, setTotalSum] = useState<any>(0)
    const [packingCharges, setPackingCharges] = useState<any>(0)
    const [unpackingCharges, setUnpackingCharges] = useState<any>(0)
    const [movingPackagesCharge, setMovingPackagesCharge] = useState<any>(0)
    const [insuranceCharge, setInsuranceCharge] = useState<any>(0)
    const [materialsCharge, setMaterialsCharge] = useState<any>(0)
    const [totalAssemblingCharge, setTotalAssemblingCharge] = useState<any>(0)
    const [totalDismantleCharge, setTotalDismantleCharge] = useState<any>(0)
    const [totalStorageCharge, setTotalStorageCharge] = useState<any>(0)
    const [certificateCharge, setCertificateCharge] = useState<any>(0)
    const [movingLiftCharges, setMovingLiftCharges] = useState<any>(0)
    const [totalPrice, setTotalPrice] = useState<any>(0);
    const priceAgreement = watch("priceAgree");



    function filterFurnitureData(data: any) {
        return data.map((room: any) => {
            const filteredFurniture = room.furnitureType.filter((furniture: any) => furniture.quantity > 0);
            const totalVolume = filteredFurniture.reduce((sum: any, furniture: any) => {
                return sum + (furniture.cubicMeter * furniture.quantity);
            }, 0);
            return {
                ...room,
                furnitureType: filteredFurniture,
                totalVolume
            };
        }).filter((room: any) => room.furnitureType.length > 0);
    }
    function convertToTimeFormat(value: number): string {
        const hours = Math.floor(value);
        const minutes = Math.round((value - hours) * 60);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

    useEffect(() => {
        const filteredData = filterFurnitureData(rooms);
        const calculatedVolume = filteredData.reduce((sum: any, room: any) => {
            return sum + room.totalVolume;
        }, 0);
        setValue('relocation.totalVolume', calculatedVolume.toFixed(2));
        if (watch('relocation.pricePerMeterCubic') === undefined || watch('relocation.pricePerMeterCubic') === '') {
            setValue('relocation.pricePerMeterCubic', settings.standardPrice?.pricePerMeterCubic || 0);
        }
        if (watch('relocation.pricePerHour') === undefined || watch('relocation.pricePerHour') === '') {
            setValue('relocation.pricePerHour', settings.standardPrice?.pricePerHour || 0);
        }
        if (watch('relocation.pricePerKilometer') === undefined || watch('relocation.pricePerKilometer') === '') {
            setValue('relocation.pricePerKilometer', settings.standardPrice?.pricePerKilometer || 0);
        }
    }, [rooms, settings, setValue]);

    const buildAddressCandidates = (addr: any): string[] => {
        if (!addr) return [];
        const candidates: string[] = [];
        const street = (addr.street || '').trim();
        const houseNumber = (addr.houseNumber || '').trim();
        const addition = (addr.addition || '').trim();
        const postcode = (addr.postcode || '').trim();
        const city = (addr.city || '').trim();
        const country = (addr.country || '').trim();

        // 1. Full address
        const full = [street, houseNumber, addition, city, postcode, country].filter(Boolean).join(' ');
        if (full) candidates.push(full);

        // 2. Street + House Number + City + Country
        const streetCity = [street, houseNumber, city, country].filter(Boolean).join(' ');
        if (streetCity && !candidates.includes(streetCity)) candidates.push(streetCity);

        // 3. Postcode + City + Country
        const postCodeCity = [postcode, city, country].filter(Boolean).join(' ');
        if (postCodeCity && !candidates.includes(postCodeCity)) candidates.push(postCodeCity);

        // 4. City + Country
        const cityCountry = [city, country].filter(Boolean).join(' ');
        if (cityCountry && !candidates.includes(cityCountry)) candidates.push(cityCountry);

        return candidates;
    };

    const geocodeAddress = async (addr: any): Promise<[number, number] | null> => {
        if (!addr) return null;
        const street = (addr.street || '').trim();
        const houseNumber = (addr.houseNumber || '').trim();
        const addition = (addr.addition || '').trim();
        const postcode = (addr.postcode || '').trim();
        const city = (addr.city || '').trim();
        const country = (addr.country || '').trim();
        const apiKey = '5b3ce3597851110001cf6248495a99f209a54de397d7d927a4a3f00b';

        // 1. Structured Postal Code lookup (Pinpoints exact postal zone & eliminates wrong village with identical name)
        if (postcode) {
            try {
                const params = new URLSearchParams({ format: 'json', postalcode: postcode });
                if (country) params.append('country', country);
                if (city) params.append('city', city);
                const nomUrl = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
                const res = await axios.get(nomUrl, {
                    timeout: 4000,
                    headers: { 'User-Agent': 'CRM-Valuation-App' },
                });
                if (Array.isArray(res.data) && res.data.length > 0) {
                    const lon = parseFloat(res.data[0].lon);
                    const lat = parseFloat(res.data[0].lat);
                    if (!isNaN(lon) && !isNaN(lat)) {
                        return [lon, lat];
                    }
                }
            } catch (e) {
                // proceed
            }
        }

        // 2. Clean comma-separated query via Nominatim
        const cleanParts = [street, houseNumber, addition, city, postcode, country]
            .filter(Boolean)
            .map((s) => String(s).trim())
            .filter((s) => s.length > 0 && s !== '0' && s !== 'undefined');

        if (cleanParts.length > 0) {
            try {
                const q = cleanParts.join(', ');
                const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`;
                const res = await axios.get(nomUrl, {
                    timeout: 4000,
                    headers: { 'User-Agent': 'CRM-Valuation-App' },
                });
                if (Array.isArray(res.data) && res.data.length > 0) {
                    const lon = parseFloat(res.data[0].lon);
                    const lat = parseFloat(res.data[0].lat);
                    if (!isNaN(lon) && !isNaN(lat)) {
                        return [lon, lat];
                    }
                }
            } catch (e) {
                // proceed
            }
        }

        // 3. Fallback candidates via OpenRouteService
        const candidates = buildAddressCandidates(addr);
        for (const query of candidates) {
            try {
                const orsUrl = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(query)}`;
                const res = await axios.get(orsUrl, { timeout: 4000 });
                if (res.data?.features?.length > 0) {
                    const coords = res.data.features[0].geometry?.coordinates;
                    if (coords && coords.length >= 2) {
                        return [coords[0], coords[1]]; // [lon, lat]
                    }
                }
            } catch (e) {
                // proceed
            }
        }
        return null;
    };

    const calculateRoute = async (
        startCoords: [number, number],
        endCoords: [number, number],
    ): Promise<{ distanceKm: number; durationHours: number }> => {
        const apiKey = '5b3ce3597851110001cf6248495a99f209a54de397d7d927a4a3f00b';

        // Tier 1: OpenRouteService Driving Directions
        try {
            const directionsUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${startCoords[0]},${startCoords[1]}&end=${endCoords[0]},${endCoords[1]}`;
            const res = await axios.get(directionsUrl, { timeout: 5000 });
            const summary = res.data?.features?.[0]?.properties?.summary;
            if (summary && summary.distance !== undefined) {
                return {
                    distanceKm: summary.distance / 1000,
                    durationHours: (summary.duration || 0) / 3600,
                };
            }
        } catch (e) {
            // Fallback to OSRM
        }

        // Tier 2: OSRM Routing
        try {
            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?overview=false`;
            const res = await axios.get(osrmUrl, { timeout: 5000 });
            if (res.data?.routes?.length > 0) {
                const route = res.data.routes[0];
                return {
                    distanceKm: route.distance / 1000,
                    durationHours: route.duration / 3600,
                };
            }
        } catch (e) {
            // Fallback to Haversine
        }

        // Tier 3: Haversine distance with road factor
        const [lon1, lat1] = startCoords;
        const [lon2, lat2] = endCoords;
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const roadKm = R * c * 1.3;
        const hours = roadKm / 60;
        return {
            distanceKm: roadKm,
            durationHours: hours,
        };
    };

    async function getDistanceAndTime(force = false) {
        const load = watch('load');
        const unload = watch('unload');

        if (!load || !unload) {
            return;
        }

        const hasLoadInfo = load.city || load.postcode || load.street;
        const hasUnloadInfo = unload.city || unload.postcode || unload.street;

        if (!hasLoadInfo || !hasUnloadInfo) {
            return;
        }

        const currentDistance = Number(watch('relocation.distance'));
        const currentTravelTime = Number(watch('relocation.travelTime'));

        if (!force && currentDistance > 0 && currentTravelTime > 0) {
            return;
        }

        setIsCalculatingDistance(true);
        try {
            const startCoords = await geocodeAddress(load);
            const endCoords = await geocodeAddress(unload);

            if (startCoords && endCoords) {
                const route = await calculateRoute(startCoords, endCoords);
                setValue('relocation.distance', route.distanceKm.toFixed(2));
                setValue('relocation.travelTime', route.durationHours.toFixed(2));
            }
        } catch (error) {
            console.error('Error calculating distance and time:', error);
        } finally {
            setIsCalculatingDistance(false);
        }
    }

    useEffect(() => {
        getDistanceAndTime().catch(console.error);
    }, [watch('load'), watch('unload')]);

    let totalVolume = Number(watch('relocation.totalVolume')) || 0;
    let pricePerMeterCubic = Number(watch('relocation.pricePerMeterCubic')) || 0;
    let travelTime = Number(watch('relocation.travelTime')) || 0;
    let pricePerHour = Number(watch('relocation.pricePerHour')) || 0;
    let distance = Number(watch('relocation.distance')) || 0;
    let pricePerKilometer = Number(watch('relocation.pricePerKilometer')) || 0;

    useEffect(() => {
        function filterBoxesData(data: any) {
            if (!Array.isArray(data)) return 0;
            return data.reduce((sum: number, room: any) => {
                const boxes = Array.isArray(room.inventoryItems)
                    ? room.inventoryItems.filter((box: any) => box.quantity > 0)
                    : [];
                const roomBoxesPrice = boxes.reduce((bSum: number, box: any) => {
                    return bSum + ((Number(box.price) || 0) * (Number(box.quantity) || 0));
                }, 0);
                return sum + roomBoxesPrice;
            }, 0);
        }
        const totalBoxesPrice = filterBoxesData(rooms);

        const cubicMeterPerHour = Number(settings.standardPrice?.cubicMeterPerHourPerEmployee) || 1;
        let priceCalculation = priceAgreement === 'onhourly_basis'
            ? (totalVolume / cubicMeterPerHour) * pricePerMeterCubic
            : totalVolume * pricePerMeterCubic;

        const relocationTotal = priceCalculation + (travelTime * pricePerHour) + (distance * pricePerKilometer) + totalBoxesPrice;
        setTotalSum(relocationTotal.toFixed(2) || '0.00');

        if (cubicMeterPerHour > 0 && totalVolume > 0) {
            setValue('relocation.requiredHours', convertToTimeFormat(totalVolume / cubicMeterPerHour));
        }
    }, [totalVolume, pricePerMeterCubic, travelTime, pricePerHour, distance, pricePerKilometer, priceAgreement, rooms, settings, setValue]);

    let packingRate = watch('packing.appliedPrice')
    let unpackingRate = watch('unpacking.appliedPrice')

    useEffect(() => {
        function boxesCount(data: any) {
            return data.map((room: any) => {
                const filteredFurniture = room.inventoryItems.filter((box: any) => box.quantity > 0);
                const boxesQuantity = filteredFurniture.reduce((sum: any, boxes: any) => {
                    return sum + boxes.quantity;
                }, 0);
                return boxesQuantity
            })
        }
        let totalBoxes = boxesCount(rooms).reduce((a: number, b: number) => a + b, 0)
        setValue('packing.requiredHours', convertToTimeFormat(totalBoxes / settings.standardPrice?.packingBoxPerHour) || 0);
        setValue('unpacking.requiredHours', convertToTimeFormat(totalBoxes / settings.standardPrice?.unPackagingBoxPerHour) || 0);

        let totalPackingCharge = totalBoxes / settings.standardPrice?.packingBoxPerHour * packingRate
        let totalUnpackingCharge = totalBoxes / settings.standardPrice?.unPackagingBoxPerHour * unpackingRate

        setPackingCharges(totalPackingCharge.toFixed(2))
        setUnpackingCharges(totalUnpackingCharge.toFixed(2))
    }, [packingRate, unpackingRate, setValue])

    let assemblingRate = watch('assembling.appliedPrice')
    let dismantleRate = watch('disassembling.appliedPrice')

    useEffect(() => {
        function totalAssembledItemsLength(data: any[], type: string): number {
            return data.reduce((totalLength: number, room: any) => {
                return totalLength + (room[type]?.length || 0);
            }, 0);
        }
        let totalItems = totalAssembledItemsLength(rooms, 'assembledItems')
        setValue('assembling.requiredHours', convertToTimeFormat(totalItems / (60 / settings?.standardPrice?.assemblingTimePerfurniture)) || 0);
        setValue('disassembling.requiredHours', convertToTimeFormat(totalAssembledItemsLength(rooms, 'dismantledItems') / (60 / settings?.standardPrice?.disassemblingTimePerfurniture)) || 0);

        let AssemblingCharge = totalItems / (60 / settings.standardPrice?.assemblingTimePerfurniture) * assemblingRate
        let DismantleCharge = totalAssembledItemsLength(rooms, 'dismantledItems') / (60 / settings.standardPrice?.disassemblingTimePerfurniture) * dismantleRate

        setTotalAssemblingCharge(AssemblingCharge.toFixed(2))
        setTotalDismantleCharge(DismantleCharge.toFixed(2))

    }, [assemblingRate, dismantleRate, setValue])

    useEffect(() => {
        function totalAssembledItemsLength(data: any[]): number {
            return data.reduce((totalLength: number, room: any) => {
                if (Array.isArray(room?.storageItems)) {
                    const roomTotal = room.storageItems.reduce((roomSum: number, item: any) => {
                        return roomSum + (item?.cubicMeter || 0);
                    }, 0);
                    return totalLength + roomTotal;
                }
                return totalLength;
            }, 0);
        }
        let totalItems = totalAssembledItemsLength(rooms);
        if (totalItems) {
            setValue('storage.storageVolume', totalItems.toFixed(2) || 0);
        }
    }, [setValue])


    let movingLift = watch('movingLift')
    useEffect(() => {
        const validQuantity = Number(movingLift?.quantity) || 0;
        const validPrice = Number(movingLift?.price) || 0;
        setMovingLiftCharges(validQuantity * validPrice);
    }, [movingLift?.quantity, movingLift?.price]);

    let movingPackages = watch('movingPackages')
    useEffect(() => {
        const validQuantity = Number(movingPackages?.quantity) || 0;
        const validPrice = Number(movingPackages?.price) || 0;
        setMovingPackagesCharge(validQuantity * validPrice);
    }, [movingPackages?.quantity, movingPackages?.price]);

    let insurance = watch('insurance')
    useEffect(() => {

        const validQuantity = Number(insurance?.quantity) || 0;
        const validPrice = Number(insurance?.price) || 0;
        setInsuranceCharge(validQuantity * validPrice);
    }, [insurance?.quantity, insurance?.price]);


    let materials = watch('materials')
    
useEffect(() => {
    if (!Array.isArray(materials)) {
        setMaterialsCharge(0);
        return;
    }
    const totalPrice = materials.reduce((total, item) => {
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.sellingPrice) || 0;
        return total + (quantity * price);
    }, 0);
    setMaterialsCharge(totalPrice);
  
}, [materials]);

    let certificate = watch('certificate')
    useEffect(() => {
        const validQuantity = Number(certificate?.quantity) || 0;
        const validPrice = Number(certificate?.price) || 0;
        setCertificateCharge(validQuantity * validPrice);
    }, [certificate?.quantity, certificate?.price]);

    let storageRate = watch('storage.appliedPrice')
    let storageVolume = watch('storage.storageVolume')
    let additionCharges = watch('storage.additionCharges')
    useEffect(() => {
        const validVolume = Number(storageVolume) || 0;
        const validPrice = Number(storageRate) || 0;
        setTotalStorageCharge((validVolume * validPrice) + Number(additionCharges));
    }, [storageRate, storageVolume, additionCharges]);

    useEffect(() => {
        const validTotalSum = isNaN(Number(totalSum)) ? 0 : Number(totalSum);
        const validPackingCharges = isNaN(Number(packingCharges)) ? 0 : Number(packingCharges);
        const validUnpackingCharges = isNaN(Number(unpackingCharges)) ? 0 : Number(unpackingCharges);
        const validMovingLiftCharges = isNaN(Number(movingLiftCharges)) ? 0 : Number(movingLiftCharges);
        const validMovingPackagesCharge = isNaN(Number(movingPackagesCharge)) ? 0 : Number(movingPackagesCharge);
        const validInsuranceCharge = isNaN(Number(insuranceCharge)) ? 0 : Number(insuranceCharge);
        const validMaterialsCharge = isNaN(Number(materialsCharge)) ? 0 : Number(materialsCharge);
        const validCertificateCharge = isNaN(Number(certificateCharge)) ? 0 : Number(certificateCharge);
        const validAssemblingCharge = isNaN(Number(totalAssemblingCharge)) ? 0 : Number(totalAssemblingCharge);
        const validTotalDismantleCharge = isNaN(Number(totalDismantleCharge)) ? 0 : Number(totalDismantleCharge);
        const validTotalStorageCharge = isNaN(Number(totalStorageCharge)) ? 0 : Number(totalStorageCharge);
        setTotalPrice(validTotalSum + validTotalStorageCharge + validAssemblingCharge + validTotalDismantleCharge + validPackingCharges + validUnpackingCharges + validMovingLiftCharges + validMovingPackagesCharge + validInsuranceCharge + validMaterialsCharge + validCertificateCharge);
    }, [totalSum, totalAssemblingCharge, totalStorageCharge, totalDismantleCharge, packingCharges, unpackingCharges, movingLiftCharges, movingPackagesCharge, insuranceCharge, materialsCharge, certificateCharge]);

    return (
        <div className="p-5 flex flex-col gap-2">
            <div className=" flex justify-end gap-5  cursor-pointer">
            <div className="flex justify-between  gap-5 items-center p-4 mb-1 bg-[#1976d2] cursor-pointer text-white rounded">
                <h3 className="text-xl font-medium">Total Price: </h3>
                <span className="text-lg font-bold">{formatCurrency(totalPrice || 0)}</span>
            </div>
            </div>
            <RelocationCalculation
                totalSum={totalSum}
                priceAgreement={priceAgreement}
                rooms={rooms}
                onRecalculateDistance={() => getDistanceAndTime(true)}
                isCalculatingDistance={isCalculatingDistance}
            />
            { materialsCharge > 0 && (
                <MaterialsCalculation totalSum={materialsCharge} materials={data.materials} />
            )}
            {selectedServices.find(
                (service: any) => service.serviceTypeName === "movingLift"
            ) && <ServiceDetails service={'movingLift'} serviceCharge={movingLiftCharges} price={selectedServices.find((service: any) => service.serviceTypeName === "movingLift")?.price} />}
            {selectedServices.find(
                (service: any) => service.serviceTypeName === "movingPackage"
            ) && <ServiceDetails service={'movingPackages'} serviceCharge={movingPackagesCharge} price={selectedServices.find((service: any) => service.serviceTypeName === "movingPackage")?.price} />}
            {selectedServices.find(
                (service: any) => service.serviceTypeName === "insurance"
            ) && <ServiceDetails service={'insurance'} serviceCharge={insuranceCharge} price={selectedServices.find((service: any) => service.serviceTypeName === "insurance")?.price} />}
            {selectedServices.find(
                (service: any) => service.serviceTypeName === "certificate"
            ) && <ServiceDetails service={'certificate'} serviceCharge={certificateCharge} price={selectedServices.find((service: any) => service.serviceTypeName === "certificate")?.price} />}
            {selectedServices.find(
                (service: any) => service.serviceTypeName === "packing"
            ) && <PackingCalculation packingCharges={packingCharges} type='packing' price={selectedServices.find((service: any) => service.serviceTypeName === "packing")?.price} />}
            {selectedServices.find(
                (service: any) => service.serviceTypeName === "unpacking"
            ) && <PackingCalculation packingCharges={unpackingCharges} type='unpacking' price={selectedServices.find((service: any) => service.serviceTypeName === "unpacking")?.price} />}
            {selectedServices.find(
                (service: any) => service.serviceTypeName === "assembling"
            ) && <AssemblingCalculation packingCharges={totalAssemblingCharge} type='assembling' price={selectedServices.find((service: any) => service.serviceTypeName === "assembling")?.price} />}
            {selectedServices.find(
                (service: any) => service.serviceTypeName === "disassembling"
            ) && <AssemblingCalculation packingCharges={totalDismantleCharge} type='disassembling' price={selectedServices.find((service: any) => service.serviceTypeName === "disassembling")?.price} />}
            {selectedServices.find(
                (service: any) => service.serviceTypeName === "storage"
            ) && <StorageCalculation packingCharges={totalStorageCharge} type='storage' price={selectedServices.find((service: any) => service.serviceTypeName === "storage")?.price} />}
        </div>
    );
};

export default PriceCalculation;

const ServiceDetails: React.FC<any> = ({ service, price, serviceCharge }) => {
    const { control, setValue } = useFormContext() as any;
    useEffect(() => {
        setValue(`${service}.price`, price)
    }, [])

    return (
<details className="group overflow-hidden border border-slate-200 bg-white transition-all duration-300">
  {/* Header */}
  <summary className="list-none cursor-pointer bg-gradient-to-r from-slate-50 to-gray-100 p-4">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-xl font-medium capitalize">
          {service} Service
        </h3>
      </div>

      <div className="flex items-center gap-4">
        <p className="text-lg font-bold">
          {formatCurrency(serviceCharge || 0)}
        </p>

        <span className="transform transition-transform group-open:rotate-180">
          ▼
        </span>
      </div>
    </div>
  </summary>

  {/* Content */}
  <div className="bg-slate-50 p-6">
    <div className="bg-white border border-slate-200 p-5 shadow-sm">
      <h4 className="mb-5 font-semibold text-slate-800 capitalize">
        {service} Details
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">


        {/* Quantity */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Quantity
          </label>

          <Controller
            name={`${service}.quantity`}
            control={control}
            defaultValue="0"
            render={({ field }) => (
              <input
                {...field}
                type="number"
                min={0}
                placeholder="Enter quantity"
                className="w-full rounded-[5px] border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            )}
          />
        </div>

        {/* Price */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Price
          </label>

          <Controller
            name={`${service}.price`}
            control={control}
            defaultValue="0"
            render={({ field }) => (
              <input
                {...field}
                type="number"
                min={0}
                placeholder="Enter amount"
                className="w-full rounded-[5px] border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            )}
          />
        </div>


      </div>
    </div>
  </div>
</details>
    )
}

